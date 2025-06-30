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
} from "../../store/features/demo/demoSlice";

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
  });
  const [demoFormError, setDemoFormError] = useState("");
  const [updateDemoMode, setUpdateDemoMode] = useState(false);
  const [latestDemo, setLatestDemo] = useState(null);
  const [openFinalDesignDialog, setOpenFinalDesignDialog] = useState(false);
  const [finalDesignFile, setFinalDesignFile] = useState(null);
  const [finalDesignError, setFinalDesignError] = useState("");

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
          // Lấy tất cả customerDetailId duy nhất
          const ids = Array.from(
            new Set(
              (res.result || []).map((r) => r.customerDetail).filter(Boolean)
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
        const res = await dispatch(getDemoDesigns(selectedRequest.id)).unwrap();
        if (res && res.length > 0) {
          setLatestDemo(res[res.length - 1]);
        } else {
          setLatestDemo(null);
        }
      }
    };
    fetchLatestDemo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDialog, selectedRequest]);

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
    setDemoForm({ designerDescription: "", customDesignImage: null });
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
    } else {
      setDemoForm((f) => ({ ...f, [name]: value }));
    }
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
                      {customerDetails[request.customerDetail] || "Đang tải..."}
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
                        <img
                          src={latestDemo.demoImage}
                          alt="Demo đã gửi"
                          style={{ maxWidth: 300, borderRadius: 8 }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
                <Typography>
                  <b>Yêu cầu:</b> {selectedRequest.requirements}
                </Typography>
                <Typography>
                  <b>Tên Doanh nghiệp:</b>{" "}
                  {customerDetails[selectedRequest.customerDetail] ||
                    "Đang tải..."}
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
                      onClick={() => setOpenDemoDialog(true)}
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
        maxWidth="xs"
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
          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            {updateDemoMode ? "Chọn ảnh demo mới" : "Chọn ảnh demo"}
            <input
              type="file"
              name="customDesignImage"
              accept="image/*"
              hidden
              onChange={handleDemoFormChange}
            />
          </Button>
          {demoForm.customDesignImage && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Đã chọn: {demoForm.customDesignImage.name}
            </Typography>
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
                await dispatch(
                  createDemoDesign({
                    customDesignRequestId: selectedRequest.id,
                    data: formData,
                  })
                ).unwrap();
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
