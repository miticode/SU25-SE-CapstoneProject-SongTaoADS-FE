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
  Container,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDesignRequestsByDesigner,
  searchDesignRequestsByDesigner,
} from "../../store/features/customeDesign/customerDesignSlice";
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
  updateDemoDesignImage,
  updateDemoDesignDescription,
} from "../../store/features/demo/demoSlice";
import { fetchImageFromS3 } from "../../store/features/s3/s3Slice";
import { getPresignedUrl } from "../../api/s3Service";
import { useDropzone } from "react-dropzone";

// Lấy designerId từ state đăng nhập
import { useSelector as useAuthSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import RefreshIcon from "@mui/icons-material/Refresh";

const DesignRequests = () => {
  const dispatch = useDispatch();
  const { user } = useAuthSelector((state) => state.auth);
  const designerId = user?.id;
  const [feedbackImageS3Url, setFeedbackImageS3Url] = useState(null); // ảnh phản hồi khách hàng

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
    if (!fileInfo)
      return <Typography variant="body2">Không có thông tin file</Typography>;

    return (
      <Box sx={{ p: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          Thông tin file:
        </Typography>
        {fileInfo.name && (
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            <strong>Tên file:</strong> {fileInfo.name}
          </Typography>
        )}
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Content Type:</strong> {fileInfo.contentType || ""}
        </Typography>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>File Type:</strong> {fileInfo.fileType || ""}
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
  // Lưu thông tin doanh nghiệp: id -> { companyName, avatar }
  const [customerDetails, setCustomerDetails] = useState({});
  // Lưu avatar URLs từ S3
  const [customerAvatars, setCustomerAvatars] = useState({});
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
  const [demoHistory, setDemoHistory] = useState([]); // lịch sử toàn bộ demo
  const [demoHistoryLoading, setDemoHistoryLoading] = useState(false);
  const [openFinalDesignDialog, setOpenFinalDesignDialog] = useState(false);
  const [finalDesignForm, setFinalDesignForm] = useState({
    finalDesignImage: null,
    subFinalDesignImages: [],
  });
  const [finalDesignError, setFinalDesignError] = useState("");

  // State để lưu S3 URLs cho sub-images
  const [s3ImageUrls, setS3ImageUrls] = useState({});

  // State để lưu S3 URL cho demo chính
  const [mainDemoS3Url, setMainDemoS3Url] = useState(null);
  // State lưu URL ảnh từng phiên bản demo trong lịch sử
  const [demoImageUrls, setDemoImageUrls] = useState({});
  // Fetch feedback image URL khi có customerFeedbackImage (đặt sau khi khai báo latestDemo & mainDemoS3Url)
  useEffect(() => {
    const fetchFeedbackImage = async () => {
      if (latestDemo && latestDemo.customerFeedbackImage) {
        try {
          if (
            latestDemo.customerFeedbackImage === latestDemo.demoImage &&
            mainDemoS3Url
          ) {
            setFeedbackImageS3Url(mainDemoS3Url);
            return;
          }
          const result = await dispatch(
            fetchImageFromS3(latestDemo.customerFeedbackImage)
          ).unwrap();
          if (result?.url) setFeedbackImageS3Url(result.url);
        } catch (e) {
          console.error("Failed to fetch customer feedback image", e);
        }
      } else {
        setFeedbackImageS3Url(null);
      }
    };
    fetchFeedbackImage();
  }, [latestDemo, dispatch, mainDemoS3Url]);

  // State để lưu S3 URLs cho final design sub-images
  const [finalDesignS3Urls, setFinalDesignS3Urls] = useState({});

  // State để lưu S3 URL cho final design image chính
  const [finalDesignMainS3Url, setFinalDesignMainS3Url] = useState(null);

  // State cho image viewer
  const [imageViewer, setImageViewer] = useState({
    open: false,
    imageUrl: "",
    title: "",
  });

  // State cho dialog cập nhật demo
  const [openUpdateDemoDialog, setOpenUpdateDemoDialog] = useState(false);
  const [updateDemoForm, setUpdateDemoForm] = useState({
    designerDescription: "",
    customDesignImage: null,
    subImages: [],
    subImagesToRemove: [], // Danh sách sub-images sẽ bị xóa
  });
  const [updateDemoError, setUpdateDemoError] = useState("");

  // State cho search
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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

  // Dropzone cho cập nhật demo - main image
  const updateMainImageDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setUpdateDemoForm((prev) => ({
          ...prev,
          customDesignImage: acceptedFiles[0],
        }));
      }
    },
  });

  // Dropzone cho cập nhật demo - sub images
  const updateSubImagesDropzone = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".webp"],
    },
    onDrop: (acceptedFiles) => {
      setUpdateDemoForm((prev) => ({
        ...prev,
        subImages: [...prev.subImages, ...acceptedFiles],
      }));
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
                    [id]: {
                      companyName: detail.companyName || "Không rõ",
                      avatar: detail.users?.avatar || null,
                    },
                  }));

                  // Fetch avatar từ S3 nếu có
                  if (detail.users?.avatar) {
                    getPresignedUrl(detail.users.avatar)
                      .then((result) => {
                        if (result.success) {
                          setCustomerAvatars((prev) => ({
                            ...prev,
                            [id]: result.url,
                          }));
                        }
                      })
                      .catch((error) => {
                        console.error("Error fetching avatar:", error);
                      });
                  }
                })
                .catch(() => {
                  setCustomerDetails((prev) => ({
                    ...prev,
                    [id]: { companyName: "Không rõ", avatar: null },
                  }));
                });
            }
          });
        })
        .catch(() => {
          setRequests([]);
        });
    }
  }, [
    designerId,
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    customerDetails,
  ]);

  // ===== CÁC FUNCTION REFRESH =====

  // Refresh danh sách yêu cầu thiết kế
  const refreshDesignRequestsData = async () => {
    if (designerId) {
      try {
        if (isSearching && searchKeyword.trim() !== "") {
          // Nếu đang tìm kiếm, refresh kết quả tìm kiếm
          const res = await dispatch(
            searchDesignRequestsByDesigner({
              keyword: searchKeyword.trim(),
              page: pagination.currentPage,
              size: pagination.pageSize,
            })
          ).unwrap();
          setRequests(res.result || []);
          setPagination({
            currentPage: res.currentPage || 1,
            totalPages: res.totalPages || 1,
            pageSize: res.pageSize || 10,
            totalElements: res.totalElements || 0,
          });
        } else {
          // Nếu không tìm kiếm, refresh danh sách gốc
          const res = await dispatch(
            fetchDesignRequestsByDesigner({
              designerId,
              page: pagination.currentPage,
              size: pagination.pageSize,
            })
          ).unwrap();
          setRequests(res.result || []);
          setPagination({
            currentPage: res.currentPage || 1,
            totalPages: res.totalPages || 1,
            pageSize: res.pageSize || 10,
            totalElements: res.totalElements || 0,
          });
        }
      } catch (error) {
        console.error("Error refreshing design requests:", error);
      }
    }
  };

  // Refresh data demo cho một request cụ thể
  const refreshDemoData = async (requestId) => {
    if (requestId) {
      try {
        setDemoHistoryLoading(true);
        const res = await dispatch(getDemoDesigns(requestId)).unwrap();
        setDemoHistory(res || []);
        if (res && res.length > 0) {
          const latest = res[res.length - 1];
          setLatestDemo(latest);
          await dispatch(getDemoSubImages(latest.id)).unwrap();
          setS3ImageUrls({});
          setMainDemoS3Url(null);
        } else {
          setLatestDemo(null);
          setS3ImageUrls({});
          setMainDemoS3Url(null);
        }
      } catch (error) {
        console.error("Error refreshing demo data:", error);
        setDemoHistory([]);
        setLatestDemo(null);
      } finally {
        setDemoHistoryLoading(false);
      }
    }
  };

  // Refresh data final design
  const refreshFinalDesignData = async (requestId) => {
    if (requestId) {
      try {
        await dispatch(getFinalDesignSubImages(requestId)).unwrap();
        setFinalDesignS3Urls({});
        setFinalDesignMainS3Url(null);
      } catch (error) {
        console.error("Error refreshing final design data:", error);
      }
    }
  };

  // Refresh tất cả data (thông minh)
  // const refreshAllData = async () => {
  //   if (selectedRequest) {
  //     await refreshDesignRequestsData();
  //     await refreshDemoData(selectedRequest.id);
  //     await refreshFinalDesignData(selectedRequest.id);
  //   } else {
  //     await refreshDesignRequestsData();
  //   }
  // }; // currently unused

  // Function để reset về trang đầu tiên khi tìm kiếm
  const resetToFirstPage = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // ===== KẾT THÚC CÁC FUNCTION REFRESH =====

  // Lấy demo mới nhất khi mở dialog chi tiết
  useEffect(() => {
    if (openDialog && selectedRequest) {
      // Sử dụng function refresh thay vì fetch thủ công
      refreshDemoData(selectedRequest.id);
      refreshFinalDesignData(selectedRequest.id);
    }
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

  // Fetch S3 URL cho từng ảnh demo trong lịch sử (trừ cái mới nhất đã có ở mainDemoS3Url)
  useEffect(() => {
    const fetchHistoryImages = async () => {
      if (!demoHistory || demoHistory.length === 0) return;
      const newUrls = {};
      for (const d of demoHistory) {
        if (!d.demoImage) continue; // không có ảnh
        // Dùng URL đã fetch của demo mới nhất nếu trùng
        if (latestDemo && d.id === latestDemo.id) {
          if (mainDemoS3Url) newUrls[d.id] = mainDemoS3Url;
          continue;
        }
        if (!demoImageUrls[d.id]) {
          try {
            const r = await dispatch(fetchImageFromS3(d.demoImage)).unwrap();
            if (r?.url) newUrls[d.id] = r.url;
          } catch (e) {
            console.error("Error fetching history demo image", d.demoImage, e);
          }
        }
      }
      if (Object.keys(newUrls).length > 0) {
        setDemoImageUrls((prev) => ({ ...prev, ...newUrls }));
      }
    };
    fetchHistoryImages();
    // Không đưa demoImageUrls vào dependencies để tránh lặp vô hạn (chỉ cập nhật khi history/latest/main thay đổi)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoHistory, latestDemo, mainDemoS3Url, dispatch]);

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
          setFinalDesignS3Urls((prev) => ({
            ...prev,
            ...newFinalDesignS3Urls,
          }));
        }
      }
    };
    fetchFinalDesignS3Urls();
  }, [finalDesignSubImages, dispatch, finalDesignS3Urls]);

  // Fetch S3 URL cho final design main image
  useEffect(() => {
    const fetchFinalDesignMainS3Url = async () => {
      if (
        selectedRequest &&
        selectedRequest.finalDesignImage &&
        !finalDesignMainS3Url
      ) {
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

    // Nếu đang tìm kiếm, cần fetch lại kết quả tìm kiếm với trang mới
    if (isSearching && searchKeyword.trim() !== "") {
      // Không cần gọi API ở đây vì useEffect sẽ tự động xử lý
      // khi pagination.currentPage thay đổi
    }
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
      // Refresh data thay vì reload thủ công
      await refreshDesignRequestsData();
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
      // Refresh data thay vì reload thủ công
      await refreshDesignRequestsData();
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
    if (isUpdate && latestDemo) {
      // Mở dialog cập nhật demo
      setUpdateDemoForm({
        designerDescription: latestDemo.designerDescription || "",
        customDesignImage: null,
        subImages: [],
        subImagesToRemove: [], // Khởi tạo danh sách sub-images sẽ bị xóa
      });
      setUpdateDemoError("");
      setOpenUpdateDemoDialog(true);
    } else {
      // Mở dialog tạo demo mới
      setDemoForm({
        designerDescription: "",
        customDesignImage: null,
        subImages: [],
      });
      setDemoFormError("");
      setUpdateDemoMode(false);
      setOpenDemoDialog(true);
    }
  };

  const handleCloseDemoDialog = () => {
    setOpenDemoDialog(false);
    setDemoFormError("");
  };

  const handleCloseUpdateDemoDialog = () => {
    setOpenUpdateDemoDialog(false);
    setUpdateDemoError("");
  };

  // Hàm cập nhật demo
  const handleUpdateDemo = async () => {
    if (!latestDemo) return;

    setActionLoading(true);
    setUpdateDemoError("");

    try {
      // Cập nhật mô tả nếu có thay đổi
      if (
        updateDemoForm.designerDescription !== latestDemo.designerDescription
      ) {
        await dispatch(
          updateDemoDesignDescription({
            customDesignId: latestDemo.id,
            data: { designerDescription: updateDemoForm.designerDescription },
          })
        ).unwrap();
      }

      // Cập nhật hình ảnh chính nếu có
      if (updateDemoForm.customDesignImage) {
        const formData = new FormData();
        // Theo Swagger: field name phải là 'file'
        formData.append("file", updateDemoForm.customDesignImage);

        await dispatch(
          updateDemoDesignImage({
            customDesignId: latestDemo.id,
            data: formData,
          })
        ).unwrap();
      }

      // Cập nhật hình ảnh phụ
      if (updateDemoForm.subImages.length > 0) {
        // Chỉ gửi sub-images mới khi có
        await dispatch(
          uploadDemoSubImages({
            customDesignId: latestDemo.id,
            files: updateDemoForm.subImages,
          })
        ).unwrap();
      }
      // Lưu ý: Không thể xóa sub-images hiện tại mà không có sub-images mới
      // vì backend yêu cầu danh sách không được rỗng

      setNotification({
        open: true,
        message: "Cập nhật demo thành công!",
        severity: "success",
      });
      setOpenUpdateDemoDialog(false);

      // Refresh data
      await refreshDemoData(selectedRequest.id);
    } catch (err) {
      setUpdateDemoError(err || "Cập nhật demo thất bại");
    }
    setActionLoading(false);
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

  // Hàm xóa sub-image khỏi danh sách cập nhật demo
  const handleRemoveUpdateSubImage = (index) => {
    setUpdateDemoForm((f) => ({
      ...f,
      subImages: f.subImages.filter((_, i) => i !== index),
    }));
  };

  // Hàm xóa sub-image hiện tại khỏi danh sách (để không lưu khi cập nhật)
  const handleRemoveCurrentSubImage = (subImageId) => {
    // Cập nhật state để đánh dấu sub-image này sẽ bị xóa
    setUpdateDemoForm((prev) => ({
      ...prev,
      subImagesToRemove: [...(prev.subImagesToRemove || []), subImageId],
    }));
  };

  const handleOpenFinalDesignDialog = () => {
    setFinalDesignForm({
      finalDesignImage: null,
      subFinalDesignImages: [],
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
      subFinalDesignImages: prev.subFinalDesignImages.filter(
        (_, i) => i !== index
      ),
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
      // Refresh data thay vì reload thủ công
      await refreshDesignRequestsData();
      await refreshFinalDesignData(selectedRequest.id);
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
      title,
    });
  };

  // Hàm đóng image viewer
  const handleCloseImageViewer = () => {
    setImageViewer({
      open: false,
      imageUrl: "",
      title: "",
    });
  };

  // Function tìm kiếm với debounce
  const handleSearch = React.useCallback(
    async (keyword) => {
      if (!designerId) return;

      setSearchLoading(true);
      setIsSearching(true);
      resetToFirstPage(); // Reset về trang đầu tiên khi tìm kiếm

      try {
        const res = await dispatch(
          searchDesignRequestsByDesigner({
            keyword: keyword.trim(),
            page: 1, // Reset về trang đầu tiên khi tìm kiếm
            size: pagination.pageSize,
          })
        ).unwrap();

        setRequests(res.result || []);
        setPagination({
          currentPage: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          pageSize: res.pageSize || 10,
          totalElements: res.totalElements || 0,
        });

        // Fetch customer details cho kết quả tìm kiếm
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
                  [id]: {
                    companyName: detail.companyName || "Không rõ",
                    avatar: detail.users?.avatar || null,
                  },
                }));

                // Fetch avatar từ S3 nếu có
                if (detail.users?.avatar) {
                  getPresignedUrl(detail.users.avatar)
                    .then((result) => {
                      if (result.success) {
                        setCustomerAvatars((prev) => ({
                          ...prev,
                          [id]: result.url,
                        }));
                      }
                    })
                    .catch((error) => {
                      console.error("Error fetching avatar:", error);
                    });
                }
              })
              .catch(() => {
                setCustomerDetails((prev) => ({
                  ...prev,
                  [id]: { companyName: "Không rõ", avatar: null },
                }));
              });
          }
        });
      } catch (error) {
        console.error("Error searching design requests:", error);
        setNotification({
          open: true,
          message: "Lỗi khi tìm kiếm yêu cầu thiết kế",
          severity: "error",
        });
      } finally {
        setSearchLoading(false);
      }
    },
    [designerId, dispatch, pagination.pageSize, customerDetails]
  );

  // Function xóa tìm kiếm và quay về danh sách gốc
  const handleClearSearch = async () => {
    setSearchKeyword("");
    setIsSearching(false);
    resetToFirstPage(); // Reset về trang đầu tiên

    // Refresh lại danh sách gốc
    if (designerId) {
      try {
        const res = await dispatch(
          fetchDesignRequestsByDesigner({
            designerId,
            page: 1,
            size: pagination.pageSize,
          })
        ).unwrap();

        setRequests(res.result || []);
        setPagination({
          currentPage: res.currentPage || 1,
          totalPages: res.totalPages || 1,
          pageSize: res.pageSize || 10,
          totalElements: res.totalElements || 0,
        });

        // Fetch customer details
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
                  [id]: {
                    companyName: detail.companyName || "Không rõ",
                    avatar: detail.users?.avatar || null,
                  },
                }));

                if (detail.users?.avatar) {
                  getPresignedUrl(detail.users.avatar)
                    .then((result) => {
                      if (result.success) {
                        setCustomerAvatars((prev) => ({
                          ...prev,
                          [id]: result.url,
                        }));
                      }
                    })
                    .catch((error) => {
                      console.error("Error fetching avatar:", error);
                    });
                }
              })
              .catch(() => {
                setCustomerDetails((prev) => ({
                  ...prev,
                  [id]: { companyName: "Không rõ", avatar: null },
                }));
              });
          }
        });
      } catch (error) {
        console.error("Error refreshing design requests:", error);
      }
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchKeyword.trim() !== "") {
        handleSearch(searchKeyword);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchKeyword, designerId, handleSearch]); // Thêm designerId & handleSearch vào dependencies

  // Cập nhật useEffect để xử lý pagination cho cả tìm kiếm và danh sách gốc
  useEffect(() => {
    if (designerId) {
      if (isSearching && searchKeyword.trim() !== "") {
        // Nếu đang tìm kiếm, sử dụng API search
        dispatch(
          searchDesignRequestsByDesigner({
            keyword: searchKeyword.trim(),
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

            // Fetch customer details cho kết quả tìm kiếm
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
                      [id]: {
                        companyName: detail.companyName || "Không rõ",
                        avatar: detail.users?.avatar || null,
                      },
                    }));

                    if (detail.users?.avatar) {
                      getPresignedUrl(detail.users.avatar)
                        .then((result) => {
                          if (result.success) {
                            setCustomerAvatars((prev) => ({
                              ...prev,
                              [id]: result.url,
                            }));
                          }
                        })
                        .catch((error) => {
                          console.error("Error fetching avatar:", error);
                        });
                    }
                  })
                  .catch(() => {
                    setCustomerDetails((prev) => ({
                      ...prev,
                      [id]: { companyName: "Không rõ", avatar: null },
                    }));
                  });
              }
            });
          })
          .catch(() => {
            setRequests([]);
          });
      } else {
        // Nếu không tìm kiếm, sử dụng API gốc
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
                      [id]: {
                        companyName: detail.companyName || "Không rõ",
                        avatar: detail.users?.avatar || null,
                      },
                    }));

                    // Fetch avatar từ S3 nếu có
                    if (detail.users?.avatar) {
                      getPresignedUrl(detail.users.avatar)
                        .then((result) => {
                          if (result.success) {
                            setCustomerAvatars((prev) => ({
                              ...prev,
                              [id]: result.url,
                            }));
                          }
                        })
                        .catch((error) => {
                          console.error("Error fetching avatar:", error);
                        });
                    }
                  })
                  .catch(() => {
                    setCustomerDetails((prev) => ({
                      ...prev,
                      [id]: { companyName: "Không rõ", avatar: null },
                    }));
                  });
              }
            });
          })
          .catch(() => {
            setRequests([]);
          });
      }
    }
  }, [
    designerId,
    dispatch,
    pagination.currentPage,
    pagination.pageSize,
    isSearching,
    searchKeyword,
    customerDetails,
  ]);

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Section */}
        <Card
          sx={{
            mb: 3,
            background:
              "linear-gradient(135deg, #0F172A 0%, #0F172A 50%, #0F172A 100%)",
            color: "white",
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
              pointerEvents: "none",
            },
          }}
        >
          <CardContent sx={{ p: 4, position: "relative", zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  width: 56,
                  height: 56,
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <AssignmentIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Yêu Cầu Thiết Kế Được Giao
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Quản lý và xử lý các yêu cầu thiết kế được phân công
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Search Bar Section */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e2e8f0",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: { md: "center" },
              }}
            >
              {/* Search Input - chiếm tối đa chiều ngang */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", md: "300px" },
                  maxWidth: { xs: "100%", md: "none" },
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm kiếm theo mã yêu cầu, tên công ty"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchKeyword && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{ color: "#64748b" }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#ffffff",
                      "&:hover fieldset": {
                        borderColor: "#3b82f6",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Box>

              {/* Action Buttons - responsive layout */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexDirection: { xs: "row", sm: "row" },
                  justifyContent: { xs: "stretch", md: "flex-end" },
                  width: { xs: "100%", md: "auto" },
                  "& .MuiButton-root": {
                    flex: { xs: 1, md: "0 0 auto" },
                    minWidth: { xs: "auto", md: "120px" },
                  },
                }}
              >
                <Button
                  variant="outlined"
                  onClick={handleClearSearch}
                  disabled={!searchKeyword.trim()}
                  startIcon={<ClearIcon />}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: "#e2e8f0",
                    color: "#64748b",
                    "&:hover": {
                      borderColor: "#64748b",
                      bgcolor: "#f8fafc",
                    },
                  }}
                >
                  Xóa
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSearch(searchKeyword)}
                  disabled={!searchKeyword.trim() || searchLoading}
                  startIcon={
                    searchLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <SearchIcon />
                    )
                  }
                  size="small"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "#3b82f6",
                    "&:hover": {
                      bgcolor: "#2563eb",
                    },
                  }}
                >
                  {searchLoading ? "Đang tìm..." : "Tìm kiếm"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Làm mới dữ liệu: nếu đang search thì refetch search, ngược lại refetch danh sách
                    if (isSearching && searchKeyword.trim() !== "") {
                      handleSearch(searchKeyword);
                    } else {
                      refreshDesignRequestsData();
                    }
                  }}
                  disabled={status === "loading" || searchLoading}
                  startIcon={
                    status === "loading" || searchLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                  size="small"
                  sx={{
                    borderRadius: 2,
                    borderColor: "#e2e8f0",
                    color: "#475569",
                    "&:hover": {
                      borderColor: "#64748b",
                      bgcolor: "#f1f5f9",
                    },
                  }}
                >
                  Làm mới
                </Button>
              </Box>
            </Box>

            {/* Search Status - responsive layout */}
            {isSearching && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "flex-start", sm: "center" },
                  gap: { xs: 1, sm: 1.5 },
                }}
              >
                <Chip
                  label={`Đang tìm kiếm: "${searchKeyword}"`}
                  color="primary"
                  size="small"
                  sx={{
                    bgcolor: "#dbeafe",
                    color: "#1e40af",
                    maxWidth: { xs: "100%", sm: "none" },
                    "& .MuiChip-label": {
                      display: "block",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      maxWidth: { xs: "250px", sm: "none" },
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="#64748b"
                  sx={{
                    fontSize: { xs: "0.875rem", sm: "0.875rem" },
                    mt: { xs: 0, sm: 0 },
                  }}
                >
                  Tìm thấy {pagination.totalElements || 0} kết quả
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {status === "loading" ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress
              size={48}
              sx={{
                color: "#0F172A",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.15)",
            }}
          >
            {error}
          </Alert>
        ) : requests.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            {isSearching
              ? `Không tìm thấy yêu cầu thiết kế nào phù hợp với từ khóa "${searchKeyword}"`
              : "Không có yêu cầu thiết kế nào được giao."}
          </Alert>
        ) : (
          <>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 2.5,
                    bgcolor: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5 }}
                  >
                    {isSearching
                      ? "Kết quả tìm kiếm"
                      : "Danh sách yêu cầu thiết kế"}
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {isSearching
                      ? `Tìm thấy ${
                          pagination.totalElements || 0
                        } yêu cầu phù hợp với "${searchKeyword}"`
                      : `Tổng cộng ${
                          pagination.totalElements || 0
                        } yêu cầu được giao`}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          bgcolor:
                            "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                          background:
                            "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            py: 2.5,
                            borderBottom: "2px solid #1d4ed8",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          Mã yêu cầu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            py: 2.5,
                            borderBottom: "2px solid #1d4ed8",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          Khách hàng
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            py: 2.5,
                            borderBottom: "2px solid #1d4ed8",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          Yêu cầu
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            py: 2.5,
                            borderBottom: "2px solid #1d4ed8",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          Trạng thái
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            color: "#ffffff",
                            fontSize: "0.875rem",
                            py: 2.5,
                            borderBottom: "2px solid #1d4ed8",
                            textAlign: "center",
                            fontFamily: "'Inter', sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          Thao tác
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow
                          key={request.id}
                          sx={{
                            "&:hover": {
                              bgcolor: "#f9fafb",
                            },
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <TableCell
                            sx={{
                              py: 2.5,
                              fontSize: "0.875rem",
                              color: "#1d4ed8",
                              fontWeight: 700,
                              fontFamily: "'Fira Code', 'Monaco', monospace",
                            }}
                          >
                            {request.code || ""}
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                              }}
                            >
                              <Avatar
                                src={
                                  customerAvatars[
                                    typeof request.customerDetail ===
                                      "object" &&
                                    request.customerDetail !== null
                                      ? request.customerDetail.id
                                      : request.customerDetail
                                  ]
                                }
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: "#e5e7eb",
                                  color: "#374151",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                }}
                              >
                                {customerDetails[
                                  typeof request.customerDetail === "object" &&
                                  request.customerDetail !== null
                                    ? request.customerDetail.id
                                    : request.customerDetail
                                ]?.companyName?.charAt(0) || "?"}
                              </Avatar>
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    color: "#1f2937",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {customerDetails[
                                    typeof request.customerDetail ===
                                      "object" &&
                                    request.customerDetail !== null
                                      ? request.customerDetail.id
                                      : request.customerDetail
                                  ]?.companyName || "Đang tải..."}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell
                            sx={{
                              py: 2.5,
                              fontSize: "0.875rem",
                              color: "#4b5563",
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {request.requirements || "Chưa có mô tả"}
                          </TableCell>
                          <TableCell sx={{ py: 2.5 }}>
                            <Chip
                              label={
                                CUSTOM_DESIGN_STATUS_MAP[request.status]
                                  ?.label || request.status
                              }
                              size="small"
                              color={
                                CUSTOM_DESIGN_STATUS_MAP[request.status]
                                  ?.color || "default"
                              }
                              sx={{
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2.5, textAlign: "center" }}>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setOpenDialog(true);
                              }}
                              sx={{
                                fontSize: "0.75rem",
                                px: 2,
                                py: 0.5,
                                minWidth: "auto",
                                borderColor: "#d1d5db",
                                color: "#374151",
                                "&:hover": {
                                  borderColor: "#9ca3af",
                                  bgcolor: "#f9fafb",
                                },
                              }}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Pagination Control */}
            {pagination.totalPages > 1 && (
              <Card
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent sx={{ py: 3 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Typography
                      variant="body2"
                      color="#6b7280"
                      sx={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.875rem",
                      }}
                    >
                      Hiển thị{" "}
                      {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
                      {Math.min(
                        pagination.currentPage * pagination.pageSize,
                        pagination.totalElements || 0
                      )}{" "}
                      của {pagination.totalElements || 0} kết quả
                    </Typography>

                    <Pagination
                      count={pagination.totalPages}
                      page={pagination.currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="medium"
                      showFirstButton
                      showLastButton
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: 1.5,
                          fontWeight: 500,
                          fontSize: "0.875rem",
                          fontFamily: "'Inter', sans-serif",
                          border: "1px solid #e5e7eb",
                          color: "#374151",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: "#3b82f6",
                            bgcolor: "#f0f9ff",
                            transform: "translateY(-1px)",
                          },
                        },
                        "& .MuiPaginationItem-page": {
                          "&.Mui-selected": {
                            bgcolor: "#3b82f6",
                            color: "white",
                            borderColor: "#3b82f6",
                            "&:hover": {
                              bgcolor: "#2563eb",
                              borderColor: "#2563eb",
                            },
                          },
                        },
                        "& .MuiPaginationItem-previousNext": {
                          "&:hover": {
                            bgcolor: "#f3f4f6",
                          },
                        },
                        "& .MuiPaginationItem-firstLast": {
                          "&:hover": {
                            bgcolor: "#f3f4f6",
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>

      {/* Dialog hiển thị chi tiết yêu cầu */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 0,
            maxHeight: "80vh",
            height: "auto",
            m: 0,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            color: "white",
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1.25rem",
            py: 2.5,
            letterSpacing: "0.25px",
          }}
        >
          Chi tiết yêu cầu thiết kế
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#ffffff", overflowX: "hidden" }}>
          {selectedRequest && (
            <Box sx={{ width: "100%" }}>
              {/* Thông Tin Cơ Bản */}
              <Card
                sx={{
                  m: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  bgcolor: "#ffffff",
                }}
              >
                <CardContent sx={{ px: 4, py: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="#1a1a1a"
                    mb={3}
                    sx={{
                      fontSize: "1.25rem",
                      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    📋 Thông Tin Yêu Cầu
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          border: "1px solid #e5e7eb",
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                            borderColor: "#d1d5db",
                          },
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Công ty
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.customerDetail?.companyName ||
                                "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Người liên hệ
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.customerDetail?.users
                                ?.fullName || "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Email
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                                wordBreak: "break-word",
                              }}
                            >
                              {selectedRequest?.customerDetail?.users?.email ||
                                "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Số điện thoại
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.customerDetail?.contactInfo ||
                                selectedRequest?.customerDetail?.users?.phone ||
                                "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Địa chỉ
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.customerDetail?.address ||
                                "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
              {/* Yêu Cầu Thiết Kế */}
              <Card
                sx={{
                  m: 0,
                  borderRadius: 0,
                  borderTop: "1px solid #e5e7eb",
                  boxShadow: "none",
                  bgcolor: "#ffffff",
                }}
              >
                <CardContent sx={{ px: 4, py: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="#1a1a1a"
                    mb={3}
                    sx={{
                      fontSize: "1.25rem",
                      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
                      letterSpacing: "-0.025em",
                    }}
                  >
                    🎨 Yêu Cầu Thiết Kế
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          border: "1px solid #e5e7eb",
                          borderRadius: 2,
                          bgcolor: "#fafafa",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: "#f5f5f5",
                            borderColor: "#d1d5db",
                          },
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Mã yêu cầu
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Fira Code', 'Monaco', monospace",
                                fontWeight: 500,
                                lineHeight: 1.5,
                                bgcolor: "#f3f4f6",
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              {selectedRequest?.code || "Chưa có mã"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Trạng thái
                            </Typography>
                            <Chip
                              label={
                                CUSTOM_DESIGN_STATUS_MAP[
                                  selectedRequest?.status
                                ]?.label ||
                                selectedRequest?.status ||
                                "Chưa xác định"
                              }
                              color={
                                CUSTOM_DESIGN_STATUS_MAP[
                                  selectedRequest?.status
                                ]?.color || "default"
                              }
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                px: 2,
                                py: 0.5,
                                height: "auto",
                                borderRadius: 1.5,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Ngày tạo
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.createdAt
                                ? new Date(
                                    selectedRequest.createdAt
                                  ).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Cập nhật lần cuối
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 500,
                                lineHeight: 1.5,
                              }}
                            >
                              {selectedRequest?.updatedAt
                                ? new Date(
                                    selectedRequest.updatedAt
                                  ).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Chưa cập nhật"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="body2"
                              color="#6b7280"
                              fontWeight={600}
                              mb={1}
                              sx={{
                                fontSize: "0.875rem",
                                fontFamily: "'Inter', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                              }}
                            >
                              Mô tả yêu cầu
                            </Typography>
                            <Typography
                              variant="body1"
                              color="#111827"
                              sx={{
                                fontSize: "1rem",
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 400,
                                lineHeight: 1.6,
                                bgcolor: "#f9fafb",
                                p: 2.5,
                                borderRadius: 2,
                                border: "1px solid #e5e7eb",
                                minHeight: "80px",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {selectedRequest?.requirements ||
                                "Chưa có mô tả chi tiết"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* {CUSTOM_DESIGN_STATUS_MAP[selectedRequest?.status]?.label ||
                selectedRequest?.status} */}
              {/* Demo Thiết Kế Section */}
              {latestDemo && (
                <Card
                  sx={{
                    m: 0,
                    borderRadius: 0,
                    borderTop: "1px solid #e2e8f0",
                    boxShadow: "none",
                  }}
                >
                  <CardContent sx={{ px: 3, py: 2.5 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#1e293b"
                      mb={2}
                      sx={{ fontSize: "1.1rem" }}
                    >
                      Demo Thiết Kế
                    </Typography>

                    {/* Demo Description */}
                    <Box mb={2.5}>
                      <Typography
                        variant="body2"
                        color="#64748b"
                        fontWeight={600}
                        mb={1}
                        sx={{ fontSize: "0.9rem", textTransform: "uppercase" }}
                      >
                        Mô tả thiết kế
                      </Typography>
                      <Typography
                        variant="body2"
                        color="#374151"
                        sx={{
                          bgcolor: "#f8fafc",
                          p: 1.5,
                          borderRadius: 1,
                          border: "1px solid #e2e8f0",
                          fontSize: "1rem",
                          lineHeight: 1.4,
                          minHeight: "50px",
                        }}
                      >
                        {latestDemo.designerDescription ||
                          "Chưa có mô tả chi tiết"}
                      </Typography>
                    </Box>

                    {/* Images Grid */}
                    <Grid container spacing={2}>
                      {/* Main Image */}
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#64748b"
                            mb={1}
                            sx={{ fontSize: "0.9rem" }}
                          >
                            Ảnh demo
                          </Typography>
                          {latestDemo.demoImage && (
                            <Paper
                              elevation={0}
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid #10b981",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                  boxShadow:
                                    "0 4px 12px rgba(16, 185, 129, 0.15)",
                                },
                              }}
                            >
                              {mainDemoS3Url ? (
                                <img
                                  src={mainDemoS3Url}
                                  alt="Demo thiết kế"
                                  style={{
                                    width: "100%",
                                    height: "200px",
                                    objectFit: "cover",
                                  }}
                                  onClick={() =>
                                    handleOpenImageViewer(
                                      mainDemoS3Url,
                                      "Demo thiết kế chính"
                                    )
                                  }
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "200px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#f0f9ff",
                                    color: "#0369a1",
                                  }}
                                >
                                  <CircularProgress
                                    size={24}
                                    sx={{ color: "#10b981" }}
                                  />
                                </Box>
                              )}
                            </Paper>
                          )}
                        </Box>
                      </Grid>

                      {/* Sub Images */}
                      <Grid item xs={12} md={6}>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#64748b"
                            mb={1}
                            sx={{ fontSize: "0.9rem" }}
                          >
                            📎 Ảnh chi tiết ({demoSubImages?.length || 0})
                          </Typography>
                          {demoSubImages && demoSubImages.length > 0 ? (
                            <Box
                              display="grid"
                              gridTemplateColumns="repeat(3, 1fr)"
                              gap={1}
                              sx={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                border: "1px solid #e2e8f0",
                                borderRadius: 2,
                                p: 1,
                                bgcolor: "white",
                              }}
                            >
                              {demoSubImages.map((img) => (
                                <Box
                                  key={img.id}
                                  sx={{
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border: "1px solid #e2e8f0",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      borderColor: "#10b981",
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                  onClick={() =>
                                    s3ImageUrls[img.id] &&
                                    handleOpenImageViewer(
                                      s3ImageUrls[img.id],
                                      img.name || "Hình ảnh chi tiết"
                                    )
                                  }
                                >
                                  {s3ImageUrls[img.id] ? (
                                    <img
                                      src={s3ImageUrls[img.id]}
                                      alt={img.name || "Chi tiết"}
                                      style={{
                                        width: "100%",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: "60px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "#f8f9fa",
                                      }}
                                    >
                                      <CircularProgress size={12} />
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                height: "200px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "white",
                                borderRadius: 2,
                                border: "1px dashed #e2e8f0",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="#94a3b8"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                Chưa có ảnh chi tiết
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Demo Status */}
                    <Box mt={2.5} pt={2} borderTop="1px solid #e2e8f0">
                      {/* Lịch sử demo */}
                      <Box mb={3}>
                        <Typography
                          variant="body2"
                          color="#64748b"
                          fontWeight={600}
                          mb={1}
                          sx={{
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                          }}
                        >
                          Lịch sử demo ({demoHistory.length})
                        </Typography>
                        {demoHistoryLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              p: 1,
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Đang tải lịch sử demo...
                            </Typography>
                          </Box>
                        ) : demoHistory.length === 0 ? (
                          <Typography variant="caption" color="text.secondary">
                            Chưa có demo nào.
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              maxHeight: 240,
                              overflowY: "auto",
                              border: "1px solid #e2e8f0",
                              borderRadius: 2,
                              p: 1,
                              background: "#fff",
                            }}
                          >
                            {demoHistory.map((d) => {
                              const isLatest =
                                latestDemo && d.id === latestDemo.id;
                              const thumbnailUrl =
                                demoImageUrls[d.id] ||
                                (isLatest ? mainDemoS3Url : null);
                              return (
                                <Box
                                  key={d.id}
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 1.5,
                                    p: 1,
                                    mb: 0.5,
                                    border: "1px solid #f1f5f9",
                                    borderRadius: 1.5,
                                    background: isLatest
                                      ? "linear-gradient(90deg,#eef2ff,#fff)"
                                      : "#f8fafc",
                                  }}
                                >
                                  <Box sx={{ minWidth: 54 }}>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                      color="#334155"
                                    >
                                      Ver {d.version}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={
                                        d.status === "APPROVED"
                                          ? "Đã chấp nhận"
                                          : d.status === "REJECTED"
                                          ? "Đã từ chối"
                                          : d.status === "PENDING"
                                          ? "Chờ phản hồi"
                                          : d.status
                                      }
                                      sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: "0.6rem",
                                        fontWeight: 600,
                                        bgcolor:
                                          d.status === "APPROVED"
                                            ? "#dcfce7"
                                            : d.status === "REJECTED"
                                            ? "#fee2e2"
                                            : "#fef9c3",
                                        color:
                                          d.status === "APPROVED"
                                            ? "#15803d"
                                            : d.status === "REJECTED"
                                            ? "#b91c1c"
                                            : "#92400e",
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="caption"
                                      color="#475569"
                                      sx={{ display: "block", fontWeight: 500 }}
                                    >
                                      {d.designerDescription || "Không mô tả"}
                                    </Typography>
                                    {d.customerNote && (
                                      <Typography
                                        variant="caption"
                                        color="#64748b"
                                        sx={{ display: "block", mt: 0.25 }}
                                      >
                                        Khách: {d.customerNote}
                                      </Typography>
                                    )}
                                    <Typography
                                      variant="caption"
                                      color="#94a3b8"
                                      sx={{ display: "block", mt: 0.5 }}
                                    >
                                      {new Date(
                                        d.updatedAt || d.createdAt
                                      ).toLocaleString("vi-VN")}
                                      {isLatest && " • Mới nhất"}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      width: 50,
                                      flexShrink: 0,
                                      cursor: d.demoImage
                                        ? "pointer"
                                        : "default",
                                      position: "relative",
                                    }}
                                    onClick={async () => {
                                      if (!d.demoImage) return;
                                      // Nếu đã có URL thì mở luôn, chưa có thì fetch
                                      if (thumbnailUrl) {
                                        handleOpenImageViewer(
                                          thumbnailUrl,
                                          `Demo v${d.version}`
                                        );
                                      } else {
                                        try {
                                          const r = await dispatch(
                                            fetchImageFromS3(d.demoImage)
                                          ).unwrap();
                                          if (r?.url) {
                                            setDemoImageUrls((prev) => ({
                                              ...prev,
                                              [d.id]: r.url,
                                            }));
                                            handleOpenImageViewer(
                                              r.url,
                                              `Demo v${d.version}`
                                            );
                                          }
                                        } catch (e) {
                                          console.error(
                                            "Open demo image failed",
                                            e
                                          );
                                        }
                                      }
                                    }}
                                  >
                                    {d.demoImage ? (
                                      thumbnailUrl ? (
                                        <Box
                                          component="img"
                                          src={thumbnailUrl}
                                          alt={"demo"}
                                          sx={{
                                            width: 50,
                                            height: 50,
                                            objectFit: "cover",
                                            borderRadius: 1,
                                            border: "1px solid #e2e8f0",
                                            background: "#fff",
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = "none";
                                          }}
                                        />
                                      ) : (
                                        <Box
                                          sx={{
                                            width: 50,
                                            height: 50,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 1,
                                            background: "#fff",
                                          }}
                                        >
                                          <CircularProgress size={14} />
                                        </Box>
                                      )
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 50,
                                          height: 50,
                                          border: "1px dashed #e2e8f0",
                                          borderRadius: 1,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: 10,
                                          color: "#94a3b8",
                                        }}
                                      >
                                        No img
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="#64748b"
                        fontWeight={600}
                        mb={1}
                        sx={{ fontSize: "0.9rem", textTransform: "uppercase" }}
                      >
                        Trạng thái demo
                      </Typography>
                      <Chip
                        label={
                          latestDemo.status === "APPROVED"
                            ? " Đã chấp nhận"
                            : latestDemo.status === "REJECTED"
                            ? " Đã từ chối"
                            : " Chờ phản hồi"
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            latestDemo.status === "APPROVED"
                              ? "#dcfce7"
                              : latestDemo.status === "REJECTED"
                              ? "#fef2f2"
                              : "#fef3c7",
                          color:
                            latestDemo.status === "APPROVED"
                              ? "#16a34a"
                              : latestDemo.status === "REJECTED"
                              ? "#dc2626"
                              : "#d97706",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      />
                      {latestDemo.status === "REJECTED" && (
                        <Box
                          mt={2}
                          sx={{
                            p: 2,
                            border: "1px solid #fecaca",
                            bgcolor: "#fef2f2",
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            color="#dc2626"
                            fontWeight={600}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: latestDemo.customerNote ? 1 : 0,
                            }}
                          >
                            ❌ Lý do khách hàng từ chối
                          </Typography>
                          {latestDemo.customerNote && (
                            <Typography
                              variant="body2"
                              color="#7f1d1d"
                              sx={{ whiteSpace: "pre-line" }}
                            >
                              {latestDemo.customerNote}
                            </Typography>
                          )}
                          {latestDemo.customerFeedbackImage && (
                            <Box mt={2}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mb: 0.5 }}
                              >
                                Ảnh phản hồi của khách hàng:
                              </Typography>
                              {feedbackImageS3Url ? (
                                <Box
                                  component="img"
                                  src={feedbackImageS3Url}
                                  alt="Ảnh phản hồi khách hàng"
                                  sx={{
                                    width: "100%",
                                    maxWidth: 300,
                                    maxHeight: 240,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "1px solid #e2e8f0",
                                    cursor: "pointer",
                                    transition: "all .25s",
                                    "&:hover": {
                                      transform: "scale(1.02)",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                                    },
                                  }}
                                  onClick={() =>
                                    handleOpenImageViewer(
                                      feedbackImageS3Url,
                                      "Ảnh phản hồi khách hàng"
                                    )
                                  }
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    height: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px dashed #e2e8f0",
                                    borderRadius: 2,
                                    background: "#fff",
                                  }}
                                >
                                  <CircularProgress size={18} />
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 1 }}
                                  >
                                    Đang tải ảnh phản hồi...
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}
              {/* Thiết Kế Chính Thức Section */}
              {(selectedRequest?.finalDesignImage ||
                (finalDesignSubImages && finalDesignSubImages.length > 0)) && (
                <Card
                  sx={{
                    m: 0,
                    borderRadius: 0,
                    borderTop: "1px solid #e2e8f0",
                    boxShadow: "none",
                  }}
                >
                  <CardContent sx={{ px: 3, py: 2.5 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      color="#1e293b"
                      mb={2}
                      sx={{ fontSize: "1.1rem" }}
                    >
                      Thiết Kế Chính Thức
                    </Typography>

                    {/* Images Grid */}
                    <Grid container spacing={2}>
                      {/* Main Final Design Image */}
                      {selectedRequest?.finalDesignImage && (
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              color="#64748b"
                              mb={1}
                              sx={{ fontSize: "0.9rem" }}
                            >
                              Thiết kế chính thức
                            </Typography>
                            <Paper
                              elevation={0}
                              sx={{
                                borderRadius: 2,
                                overflow: "hidden",
                                border: "1px solid #fbbf24",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                  boxShadow:
                                    "0 4px 12px rgba(251, 191, 36, 0.15)",
                                },
                              }}
                            >
                              {finalDesignMainS3Url ? (
                                <img
                                  src={finalDesignMainS3Url}
                                  alt="Thiết kế chính thức"
                                  style={{
                                    width: "100%",
                                    height: "200px",
                                    objectFit: "cover",
                                  }}
                                  onClick={() =>
                                    handleOpenImageViewer(
                                      finalDesignMainS3Url,
                                      "Thiết kế chính thức"
                                    )
                                  }
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: "100%",
                                    height: "200px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "#fefce8",
                                    color: "#d97706",
                                  }}
                                >
                                  <CircularProgress
                                    size={24}
                                    sx={{ color: "#fbbf24" }}
                                  />
                                </Box>
                              )}
                            </Paper>
                          </Box>
                        </Grid>
                      )}

                      {/* Final Design Sub Images */}
                      <Grid
                        item
                        xs={12}
                        md={selectedRequest?.finalDesignImage ? 6 : 12}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="#64748b"
                            mb={1}
                            sx={{ fontSize: "0.9rem" }}
                          >
                            Ảnh chi tiết ({finalDesignSubImages?.length || 0})
                          </Typography>
                          {finalDesignSubImages &&
                          finalDesignSubImages.length > 0 ? (
                            <Box
                              display="grid"
                              gridTemplateColumns="repeat(3, 1fr)"
                              gap={1}
                              sx={{
                                maxHeight: "200px",
                                overflowY: "auto",
                                border: "1px solid #e2e8f0",
                                borderRadius: 2,
                                p: 1,
                                bgcolor: "white",
                              }}
                            >
                              {finalDesignSubImages.map((img) => (
                                <Box
                                  key={img.id}
                                  sx={{
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border: "1px solid #e2e8f0",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      borderColor: "#fbbf24",
                                      transform: "scale(1.05)",
                                    },
                                  }}
                                  onClick={() =>
                                    finalDesignS3Urls[img.id] &&
                                    handleOpenImageViewer(
                                      finalDesignS3Urls[img.id],
                                      img.name || "File thiết kế chi tiết"
                                    )
                                  }
                                >
                                  {finalDesignS3Urls[img.id] ? (
                                    <img
                                      src={finalDesignS3Urls[img.id]}
                                      alt={img.name || "Thiết kế chi tiết"}
                                      style={{
                                        width: "100%",
                                        height: "60px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: "100%",
                                        height: "60px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "#fefce8",
                                      }}
                                    >
                                      <CircularProgress size={12} />
                                    </Box>
                                  )}
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                height: "200px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "white",
                                borderRadius: 2,
                                border: "1px dashed #e2e8f0",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="#94a3b8"
                                sx={{ fontSize: "0.8rem" }}
                              >
                                Chưa có file chi tiết
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
              {/* Action Button for Revision */}
              {selectedRequest &&
                selectedRequest.status === "REVISION_REQUESTED" && (
                  <Box
                    sx={{
                      p: 6,
                      bgcolor: "#f8fafc",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => handleOpenDemoDialog(false)}
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: 4,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        bgcolor: "#0F172A",
                        color: "white",
                        letterSpacing: "-0.015em",
                        "&:hover": {
                          bgcolor: "#1e293b",
                          transform: "translateY(-1px)",
                          boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                        },
                        transition: "all 0.2s ease-in-out",
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
            bgcolor: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            gap: 3,
            justifyContent: "space-between",
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
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": {
                borderColor: "#0F172A",
                color: "#0F172A",
                bgcolor: "white",
              },
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
                  fontSize: "1rem",
                  bgcolor: "#0F172A",
                  color: "white",
                  letterSpacing: "-0.015em",
                  "&:hover": {
                    bgcolor: "#1e293b",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                Gửi Demo
              </Button>
            )}

            {selectedRequest && selectedRequest.status === "DEMO_SUBMITTED" && (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenDemoDialog(true)}
                  disabled={actionLoading}
                  sx={{
                    borderRadius: 4,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    bgcolor: "#f59e0b",
                    color: "white",
                    letterSpacing: "-0.015em",
                    "&:hover": {
                      bgcolor: "#d97706",
                      transform: "translateY(-1px)",
                      boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  Cập nhật Demo
                </Button>
              </Stack>
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
                  fontSize: "1rem",
                  bgcolor: "#059669",
                  color: "white",
                  letterSpacing: "-0.015em",
                  "&:hover": {
                    bgcolor: "#047857",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                  },
                  transition: "all 0.2s ease-in-out",
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
                "COMPLETED", // Thêm COMPLETED vào danh sách ẩn
                "CANCELLED", // Thêm CANCELLED vào danh sách ẩn
                "REJECTED_PRICING", // Thêm REJECTED_PRICING vào danh sách ẩn
                "DEPOSITED", // Ẩn khi khách đã đặt cọc
                "DESIGNER_REJECTED", // Ẩn khi designer đã từ chối
                "WAITING_FULL_PAYMENT", // Ẩn khi đang chờ thanh toán đủ (đã đặt cọc)
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
                      fontSize: "1rem",
                      bgcolor: "#059669",
                      color: "white",
                      letterSpacing: "-0.015em",
                      "&:hover": {
                        bgcolor: "#047857",
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                      },
                      transition: "all 0.2s ease-in-out",
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
                      fontSize: "1rem",
                      borderColor: "#dc2626",
                      color: "#dc2626",
                      letterSpacing: "-0.015em",
                      "&:hover": {
                        bgcolor: "#dc2626",
                        color: "white",
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1)",
                      },
                      transition: "all 0.2s ease-in-out",
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

                // Refresh data thay vì reload thủ công
                await refreshDesignRequestsData();
                await refreshDemoData(selectedRequest.id);
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
                Đã chọn {finalDesignForm.subFinalDesignImages.length} ảnh chi
                tiết:
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
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
            maxWidth: "95vw",
            maxHeight: "95vh",
          },
        }}
      >
        <Backdrop
          sx={{
            bgcolor: "rgba(0, 0, 0, 0.9)",
            zIndex: -1,
          }}
          open={imageViewer.open}
          onClick={handleCloseImageViewer}
        />
        <DialogContent
          sx={{
            p: 0,
            bgcolor: "transparent",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
          }}
        >
          {imageViewer.title && (
            <Typography
              variant="h6"
              color="white"
              mb={2}
              textAlign="center"
              sx={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
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
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                cursor: "zoom-in",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          )}
          <Typography
            variant="body2"
            color="rgba(255,255,255,0.7)"
            mt={2}
            textAlign="center"
            sx={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
          >
            Click bên ngoài để đóng
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Dialog cập nhật demo */}
      <Dialog
        open={openUpdateDemoDialog}
        onClose={handleCloseUpdateDemoDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Cập nhật demo thiết kế</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Bạn có thể cập nhật mô tả, hình ảnh chính và hình ảnh phụ của demo
            hiện tại.
          </Typography>

          {/* Mô tả demo */}
          <TextField
            label="Mô tả demo"
            name="designerDescription"
            value={updateDemoForm.designerDescription}
            onChange={(e) =>
              setUpdateDemoForm((prev) => ({
                ...prev,
                designerDescription: e.target.value,
              }))
            }
            fullWidth
            margin="normal"
            multiline
            minRows={2}
          />

          {/* Ảnh demo chính */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Ảnh demo chính
          </Typography>

          {/* Hiển thị ảnh demo chính hiện tại */}
          {!updateDemoForm.customDesignImage &&
            mainDemoS3Url &&
            latestDemo?.demoImage && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1 }}
                >
                  Ảnh demo chính hiện tại:
                </Typography>
                <Box
                  sx={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    p: 2,
                    bgcolor: "#f8fafc",
                    display: "inline-block",
                  }}
                >
                  {mainDemoS3Url ? (
                    <img
                      src={mainDemoS3Url}
                      alt="Current demo"
                      style={{
                        maxWidth: "100%",
                        maxHeight: 200,
                        borderRadius: 8,
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 200,
                        height: 200,
                        bgcolor: "#f3f4f6",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px dashed #d1d5db",
                      }}
                    >
                      <CircularProgress size={30} />
                    </Box>
                  )}
                </Box>
              </Box>
            )}

          {/* Dropzone cho ảnh chính mới */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Chọn ảnh mới để thay thế (tùy chọn):
          </Typography>
          <Box
            {...updateMainImageDropzone.getRootProps()}
            sx={{
              border: "2px dashed #f59e0b",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: updateMainImageDropzone.isDragActive
                ? "#fef3c7"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#fef3c7" },
              mb: 2,
            }}
          >
            <input {...updateMainImageDropzone.getInputProps()} />
            {updateDemoForm.customDesignImage ? (
              <Box>
                <img
                  src={URL.createObjectURL(updateDemoForm.customDesignImage)}
                  alt="Updated demo"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: 8,
                    objectFit: "contain",
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {updateDemoForm.customDesignImage.name}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUpdateDemoForm((prev) => ({
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
                  {updateMainImageDropzone.isDragActive
                    ? "Thả ảnh vào đây..."
                    : "Kéo thả ảnh hoặc click để chọn (tùy chọn)"}
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

          {/* Hiển thị sub-images hiện tại */}
          {demoSubImages && demoSubImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Sub-images hiện tại (
                {
                  demoSubImages.filter(
                    (subImage) =>
                      !updateDemoForm.subImagesToRemove.includes(subImage.id)
                  ).length
                }{" "}
                ảnh):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {demoSubImages
                  .filter(
                    (subImage) =>
                      !updateDemoForm.subImagesToRemove.includes(subImage.id)
                  )
                  .map((subImage) => (
                    <Box
                      key={subImage.id}
                      sx={{
                        position: "relative",
                        border: "1px solid #e2e8f0",
                        borderRadius: 1,
                        p: 0.5,
                        bgcolor: "white",
                      }}
                    >
                      {s3ImageUrls[subImage.id] ? (
                        <img
                          src={s3ImageUrls[subImage.id]}
                          alt={`Sub image ${subImage.id}`}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "#f3f4f6",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px dashed #d1d5db",
                          }}
                        >
                          <CircularProgress size={20} />
                        </Box>
                      )}
                      {/* Nút xóa sub-image */}
                      <IconButton
                        size="small"
                        disabled={updateDemoForm.subImages.length === 0}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor:
                            updateDemoForm.subImages.length === 0
                              ? "#9ca3af"
                              : "error.main",
                          color: "white",
                          "&:hover": {
                            bgcolor:
                              updateDemoForm.subImages.length === 0
                                ? "#9ca3af"
                                : "error.dark",
                          },
                          width: 24,
                          height: 24,
                          cursor:
                            updateDemoForm.subImages.length === 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                        onClick={() => handleRemoveCurrentSubImage(subImage.id)}
                        title={
                          updateDemoForm.subImages.length === 0
                            ? "Phải thêm ít nhất một sub-image mới để có thể xóa"
                            : "Xóa sub-image này"
                        }
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
              </Box>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                Lưu ý: Nút X sẽ bị disable (màu xám) khi không có sub-images mới
                nào. Để xóa sub-images hiện tại, bạn phải thêm ít nhất một
                sub-image mới để thay thế.
              </Typography>
            </Box>
          )}

          {/* Dropzone cho sub-images mới */}
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            Chọn ảnh mới để thêm vào (tùy chọn):
          </Typography>
          <Box
            {...updateSubImagesDropzone.getRootProps()}
            sx={{
              border: "2px dashed #f59e0b",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              bgcolor: updateSubImagesDropzone.isDragActive
                ? "#fef3c7"
                : "transparent",
              transition: "all 0.2s",
              "&:hover": { bgcolor: "#fef3c7" },
              mb: 2,
            }}
          >
            <input {...updateSubImagesDropzone.getInputProps()} />
            <Typography variant="body1" color="textSecondary">
              {updateSubImagesDropzone.isDragActive
                ? "Thả ảnh vào đây..."
                : "Kéo thả nhiều ảnh hoặc click để chọn (tùy chọn)"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Có thể chọn nhiều ảnh cùng lúc
            </Typography>
          </Box>

          {/* Hiển thị danh sách sub-images sẽ được lưu */}
          {updateDemoForm.subImages.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Sub-images mới sẽ được lưu ({updateDemoForm.subImages.length}{" "}
                ảnh):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {/* Hiển thị sub-images mới */}
                {updateDemoForm.subImages.map((file, index) => (
                  <Box
                    key={`new-${index}`}
                    sx={{
                      position: "relative",
                      border: "1px solid #f59e0b",
                      borderRadius: 1,
                      p: 0.5,
                      bgcolor: "#fffbeb",
                    }}
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New sub image ${index + 1}`}
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
                      onClick={() => handleRemoveUpdateSubImage(index)}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: -20,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: "10px",
                        color: "#d97706",
                      }}
                    >
                      Mới
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {updateDemoError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {updateDemoError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseUpdateDemoDialog}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateDemo}
            variant="contained"
            color="primary"
            disabled={actionLoading}
          >
            {actionLoading ? "Đang cập nhật..." : "CẬP NHẬT"}
          </Button>
        </DialogActions>
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
    </>
  );
};

export default DesignRequests;
