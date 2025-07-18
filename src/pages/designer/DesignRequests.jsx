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
  const [finalDesignFile, setFinalDesignFile] = useState(null);
  const [finalDesignError, setFinalDesignError] = useState("");
  // State cho upload sub-image demo
  const [uploadingSubImage, setUploadingSubImage] = useState(false);

  // State để lưu S3 URLs cho sub-images
  const [s3ImageUrls, setS3ImageUrls] = useState({});

  // State để lưu S3 URL cho demo chính
  const [mainDemoS3Url, setMainDemoS3Url] = useState(null);

  // Lấy sub-images cho demo hiện tại
  const demoSubImages = useSelector((state) =>
    latestDemo ? selectDemoSubImages(state, latestDemo.id) : []
  );

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
            dispatch(getDemoSubImages(null)); // clear sub-images
          }
        } catch (error) {
          console.error("Error fetching demo:", error);
          setLatestDemo(null);
          dispatch(getDemoSubImages(null));
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
    setFinalDesignFile(null);
    setFinalDesignError("");
    setOpenFinalDesignDialog(true);
  };
  const handleCloseFinalDesignDialog = () => {
    setOpenFinalDesignDialog(false);
    setFinalDesignError("");
  };
  const handleFinalDesignFileChange = (e) => {
    setFinalDesignFile(e.target.files[0]);
  };
  const handleSubmitFinalDesign = async () => {
    if (!finalDesignFile) {
      setFinalDesignError("Vui lòng chọn file thiết kế chính thức.");
      return;
    }
    setActionLoading(true);
    setFinalDesignError("");
    try {
      await dispatch(
        sendFinalDesignImage({
          customDesignRequestId: selectedRequest.id,
          file: finalDesignFile,
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

  // Hàm upload sub-image cho demo
  const handleUploadDemoSubImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !latestDemo) return;
    setUploadingSubImage(true);
    try {
      await dispatch(
        uploadDemoSubImages({ customDesignId: latestDemo.id, files: [file] })
      ).unwrap();
      // Fetch lại sub-images sau khi upload thành công
      await dispatch(getDemoSubImages(latestDemo.id)).unwrap();
      console.log("Upload sub-image thành công");
    } catch (error) {
      console.error("Error uploading sub-image:", error);
      // Có thể show thông báo lỗi nếu muốn
    }
    setUploadingSubImage(false);
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
      >
        <DialogTitle>Chi tiết yêu cầu thiết kế</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Thông tin yêu cầu
                </Typography>
                {/* Hiển thị mô tả và ảnh demo nếu có */}
                {latestDemo && (
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle2" color="primary">
                      Demo đã gửi:
                    </Typography>
                    <Typography>
                      <b>Mô tả demo:</b>{" "}
                      {latestDemo.designerDescription || "(Không có)"}
                    </Typography>
                    {latestDemo.demoImage && (
                      <Box mt={1}>
                        {mainDemoS3Url ? (
                          <img
                            src={mainDemoS3Url}
                            alt="Demo đã gửi"
                            style={{
                              maxWidth: 300,
                              borderRadius: 8,
                              objectFit: "contain",
                            }}
                            onError={(e) => {
                              console.error(
                                "Error loading main demo S3 image:",
                                latestDemo.demoImage
                              );
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 300,
                              height: 200,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "#f5f5f5",
                              borderRadius: 8,
                              border: "1px dashed #ccc",
                            }}
                          >
                            <CircularProgress size={32} />
                          </Box>
                        )}
                      </Box>
                    )}
                    {/* Hiển thị sub-images của demo */}
                    <Box
                      mt={2}
                      display="flex"
                      flexWrap="wrap"
                      gap={2}
                      alignItems="center"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ width: "100%", mb: 1 }}
                      >
                        Hình ảnh chi tiết Demo:
                      </Typography>

                      {/* Debug info */}
                      {window.location.hostname === "localhost" && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ width: "100%", mb: 1 }}
                        >
                          Debug: latestDemo.id = {latestDemo?.id},
                          demoSubImages.length = {demoSubImages?.length || 0},
                          mainDemoS3Url = {mainDemoS3Url ? "loaded" : "loading"}
                        </Typography>
                      )}

                      {/* Loading state */}
                      {status === "loading" && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <CircularProgress size={20} />
                          <Typography variant="body2">
                            Đang tải hình ảnh...
                          </Typography>
                        </Box>
                      )}

                      {/* Hiển thị sub-images */}
                      {demoSubImages &&
                      Array.isArray(demoSubImages) &&
                      demoSubImages.length > 0 ? (
                        demoSubImages.map((img) => (
                          <Box
                            key={img.id}
                            border={1}
                            borderColor="grey.300"
                            borderRadius={2}
                            p={0.5}
                            sx={{ bgcolor: "white" }}
                          >
                            {s3ImageUrls[img.id] ? (
                              <img
                                src={s3ImageUrls[img.id]}
                                alt={img.name || "Sub image"}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: "cover",
                                  borderRadius: 8,
                                }}
                                onError={(e) => {
                                  console.error(
                                    "Error loading S3 image:",
                                    img.imageUrl
                                  );
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 80,
                                  height: 80,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#f5f5f5",
                                  borderRadius: 8,
                                }}
                              >
                                <CircularProgress size={24} />
                              </Box>
                            )}
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Chưa có hình ảnh chi tiết
                        </Typography>
                      )}

                      {/* Ô + để upload sub-image */}
                      {latestDemo && (
                        <Box>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            id="upload-demo-sub-image"
                            onChange={handleUploadDemoSubImage}
                            disabled={uploadingSubImage}
                          />
                          <label htmlFor="upload-demo-sub-image">
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                border: "2px dashed #1976d2",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: uploadingSubImage
                                  ? "not-allowed"
                                  : "pointer",
                                color: "#1976d2",
                                fontSize: 32,
                                fontWeight: "bold",
                                background: uploadingSubImage
                                  ? "#f5f5f5"
                                  : "transparent",
                                transition: "all 0.2s",
                                ":hover": { background: "#e3f2fd" },
                              }}
                            >
                              {uploadingSubImage ? (
                                <CircularProgress size={28} />
                              ) : (
                                "+"
                              )}
                            </Box>
                          </label>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
                <Typography>
                  <b>Yêu cầu:</b> {selectedRequest.requirements}
                </Typography>
                <Typography>
                  <b>Tên Doanh nghiệp:</b>{" "}
                  {customerDetails[
                    typeof selectedRequest.customerDetail === "object" &&
                    selectedRequest.customerDetail !== null
                      ? selectedRequest.customerDetail.id
                      : selectedRequest.customerDetail
                  ] || "Đang tải..."}
                </Typography>
                <Typography>
                  <b>Tổng tiền:</b>{" "}
                  {selectedRequest.totalPrice?.toLocaleString("vi-VN") || 0}₫
                </Typography>
                <Typography>
                  <b>Đặt cọc:</b>{" "}
                  {selectedRequest.depositAmount?.toLocaleString("vi-VN") || 0}₫
                </Typography>
                <Typography>
                  <b>Còn lại:</b>{" "}
                  {selectedRequest.remainingAmount?.toLocaleString("vi-VN") ||
                    0}
                  ₫
                </Typography>
                <Typography>
                  <b>Ngày tạo:</b>{" "}
                  {new Date(selectedRequest.createAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </Typography>
                {/* Hiển thị trạng thái mới nhất của đơn */}
                <Box mt={1}>
                  <Chip
                    label={
                      CUSTOM_DESIGN_STATUS_MAP[selectedRequest.status]?.label ||
                      selectedRequest.status
                    }
                    color={
                      CUSTOM_DESIGN_STATUS_MAP[selectedRequest.status]?.color ||
                      "default"
                    }
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                {/* Thông tin sản phẩm và lựa chọn */}
                {selectedRequest.customerChoiceHistories && (
                  <>
                    <Typography mt={2}>
                      <b>Loại sản phẩm:</b>{" "}
                      {selectedRequest.customerChoiceHistories.productTypeName}
                    </Typography>
                    <Typography>
                      <b>Công thức tính:</b>{" "}
                      {selectedRequest.customerChoiceHistories.calculateFormula}
                    </Typography>
                    {/* Bảng thuộc tính đã chọn */}
                    <Typography mt={1}>
                      <b>Thuộc tính đã chọn:</b>
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Thuộc tính</TableCell>
                            <TableCell>Giá trị</TableCell>
                            <TableCell>Đơn vị</TableCell>
                            <TableCell align="right">Đơn giá</TableCell>
                            <TableCell align="right">Thành tiền</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequest.customerChoiceHistories.attributeSelections?.map(
                            (attr, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{attr.attribute}</TableCell>
                                <TableCell>{attr.value}</TableCell>
                                <TableCell>{attr.unit}</TableCell>
                                <TableCell align="right">
                                  {attr.unitPrice?.toLocaleString("vi-VN") || 0}
                                  ₫
                                </TableCell>
                                <TableCell align="right">
                                  {attr.subTotal?.toLocaleString("vi-VN") || 0}₫
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Bảng kích thước đã chọn */}
                    <Typography mt={1}>
                      <b>Kích thước đã chọn:</b>
                    </Typography>
                    <TableContainer
                      component={Paper}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Kích thước</TableCell>
                            <TableCell>Giá trị</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequest.customerChoiceHistories.sizeSelections?.map(
                            (size, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{size.size}</TableCell>
                                <TableCell>{size.value}</TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
                {/* Khi status là REVISION_REQUESTED, luôn hiển thị nút GỬI LẠI DEMO */}
                {selectedRequest &&
                  selectedRequest.status === "REVISION_REQUESTED" && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDemoDialog(false)}
                      sx={{ mt: 2 }}
                    >
                      GỬI LẠI DEMO
                    </Button>
                  )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={actionLoading}>
            Đóng
          </Button>
          {selectedRequest && selectedRequest.status === "PROCESSING" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenDemoDialog(false)}
              disabled={actionLoading}
            >
              GỬI DEMO
            </Button>
          )}
          {selectedRequest && selectedRequest.status === "DEMO_SUBMITTED" && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => handleOpenDemoDialog(true)}
              disabled={actionLoading}
            >
              CẬP NHẬT DEMO
            </Button>
          )}
          {selectedRequest && selectedRequest.status === "FULLY_PAID" && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenFinalDesignDialog}
              disabled={actionLoading}
            >
              GỬI BẢN THIẾT KẾ CHÍNH THỨC
            </Button>
          )}
          {/* {selectedRequest &&
            selectedRequest.status === "REVISION_REQUESTED" && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDemoDialog("revision")}
                disabled={actionLoading}
              >
                GỬI LẠI DEMO
              </Button>
            )} */}
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
                  color="success"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Đang xử lý..." : "Chấp nhận"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Đang xử lý..." : "Từ chối"}
                </Button>
              </>
            )}
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
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Gửi bản thiết kế chính thức</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Chọn file thiết kế chính thức
            <input
              type="file"
              accept="image/*,application/pdf"
              hidden
              onChange={handleFinalDesignFileChange}
            />
          </Button>
          {finalDesignFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Đã chọn: {finalDesignFile.name}
            </Typography>
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
