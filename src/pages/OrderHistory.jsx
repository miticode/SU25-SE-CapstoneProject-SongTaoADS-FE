import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import HistoryIcon from "@mui/icons-material/History";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import BrushIcon from "@mui/icons-material/Brush";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import DescriptionIcon from "@mui/icons-material/Description";
import {
  fetchCustomDesignRequestsByCustomerDetail,
  setCurrentDesignRequest,
  selectCurrentDesignRequest,
} from "../store/features/customeDesign/customerDesignSlice";
import {
  createOrderFromDesignRequest,
  fetchOrdersByUserId,
} from "../store/features/order/orderSlice";
import { fetchCustomerDetailByUserId } from "../store/features/customer/customerSlice";
import {
  getPriceProposals,
  approvePriceProposal,
  offerPriceProposal,
} from "../api/priceService";
import { payCustomDesignDepositThunk } from "../store/features/payment/paymentSlice";
import {
  CONTRACT_STATUS_MAP,
  discussContract,
  getOrderContract,
  selectContractError,
  selectContractLoading,
} from "../store/features/contract/contractSlice";
import { openFileInNewTab } from "../api/s3Service";

const statusMap = {
  APPROVED: { label: "Đã xác nhận", color: "success" },
  CONFIRMED: { label: "Đã xác nhận", color: "success" },
  REJECTED: { label: "Bị từ chối", color: "error" },
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  DEPOSITED: { label: "Đã đặt cọc", color: "info" },
  COMPLETED: { label: "Hoàn tất", color: "primary" },
  CANCELLED: { label: "Đã bị hủy", color: "error" },
  FULLY_PAID: { label: "Đã thanh toán", color: "success" },
  PENDING_CONTRACT: { label: "Đang chờ hợp đồng", color: "warning" },
  CONTRACT_SENT: { label: "Hợp đồng đã được gửi", color: "info" }, 
  CONTRACT_DISCUSS: { label: "Chờ thương lượng hợp đồng", color: "warning" },
};

const OrderHistory = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [constructionLoading, setConstructionLoading] = useState(false);
  // Redux state for custom design requests
  const contractLoading = useSelector(selectContractLoading);
  const contractError = useSelector(selectContractError);
  const [contractData, setContractData] = useState({}); // Lưu contract theo orderId
  const [discussLoading, setDiscussLoading] = useState(false);
  const [contractDialog, setContractDialog] = useState({
    open: false,
    contract: null,
    orderId: null,
  });
  const customDesignState = useSelector((state) => state.customDesign);
  const {
    designRequests,
    status: customStatus,
    error: customError,
  } = customDesignState;

  // Redux state for orders
  const orders = useSelector((state) => state.order.orders);
  const orderLoading = useSelector((state) => state.order.loading);
  const orderError = useSelector((state) => state.order.error);

  const [customerDetailId, setCustomerDetailId] = useState(undefined);
  const currentDesignRequest = useSelector(selectCurrentDesignRequest);
  const [openDetail, setOpenDetail] = useState(false);
  const [priceProposals, setPriceProposals] = useState([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
   const [contractViewLoading, setContractViewLoading] = useState(false);

  const [offerDialog, setOfferDialog] = useState({
    open: false,
    proposalId: null,
  });
  const [offerForm, setOfferForm] = useState({
    totalPriceOffer: "",
    depositAmountOffer: "",
    rejectionReason: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [depositLoadingId, setDepositLoadingId] = useState(null);
    const handleDiscussContract = async (contractId) => {
    if (!contractId) {
      setNotification({
        open: true,
        message: "Không có ID hợp đồng",
        severity: "error",
      });
      return;
    }

    setDiscussLoading(true);
    try {
      const result = await dispatch(discussContract(contractId));
      if (discussContract.fulfilled.match(result)) {
        setNotification({
          open: true,
          message: "Đã gửi yêu cầu thảo luận hợp đồng thành công",
          severity: "success",
        });
        
        // Cập nhật lại contract dialog với dữ liệu mới
        setContractDialog(prev => ({
          ...prev,
          contract: result.payload
        }));
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể gửi yêu cầu thảo luận",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi gửi yêu cầu thảo luận",
        severity: "error",
      });
    } finally {
      setDiscussLoading(false);
    }
  };
    const handleViewContract = async (contractUrl, contractType = "contract") => {
    if (!contractUrl) {
      setNotification({
        open: true,
        message: "Không có URL hợp đồng",
        severity: "error",
      });
      return;
    }

    setContractViewLoading(true);
    try {
      const result = await openFileInNewTab(contractUrl, 30);
      if (!result.success) {
        setNotification({
          open: true,
          message: result.message || "Không thể mở hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi mở hợp đồng",
        severity: "error",
      });
    } finally {
      setContractViewLoading(false);
    }
  };
    

  const handleGetContract = async (orderId) => {
    try {
      const result = await dispatch(getOrderContract(orderId));
      if (getOrderContract.fulfilled.match(result)) {
        setContractData((prev) => ({
          ...prev,
          [orderId]: result.payload,
        }));
        setContractDialog({
          open: true,
          contract: result.payload,
          orderId: orderId,
        });
      } else {
        setNotification({
          open: true,
          message: result.payload || "Không thể lấy thông tin hợp đồng",
          severity: "error",
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: "Lỗi khi lấy hợp đồng",
        severity: "error",
      });
    }
  };
  const handleCloseContractDialog = () => {
    setContractDialog({
      open: false,
      contract: null,
      orderId: null,
    });
  };
  const handleConstructionChoice = (designRequestId, needConstruction) => {
    setConstructionLoading(true);

    // Tìm design request theo ID để cập nhật UI
    const designRequest = designRequests.find(
      (req) => req.id === designRequestId
    );

    if (designRequest) {
      // Cập nhật state local
      dispatch(
        setCurrentDesignRequest({
          ...designRequest,
          isNeedSupport: needConstruction,
        })
      );

      // Nếu chọn "Có thi công" thì gọi API tạo đơn hàng
      if (needConstruction) {
        dispatch(createOrderFromDesignRequest(designRequestId)).then(
          (resultAction) => {
            if (createOrderFromDesignRequest.fulfilled.match(resultAction)) {
              setNotification({
                open: true,
                message:
                  "Đã chọn có thi công và tạo đơn hàng thành công! Vui lòng đợi hợp đồng từ chúng tôi.",
                severity: "success",
              });

              // Tải lại danh sách đơn hàng
              if (user?.id) {
                dispatch(fetchOrdersByUserId(user.id));
              }
            } else {
              setNotification({
                open: true,
                message:
                  resultAction.payload ||
                  "Đã chọn có thi công nhưng không thể tạo đơn hàng!",
                severity: "error",
              });
            }
            setConstructionLoading(false);
          }
        );
      } else {
        // Nếu chọn "Không thi công" thì hiện thông báo bình thường
        setNotification({
          open: true,
          message: "Đơn hàng sẽ không thi công, cảm ơn bạn",
          severity: "success",
        });
        setConstructionLoading(false);
      }

      // Cập nhật lại danh sách đơn thiết kế để hiển thị đúng trạng thái
      dispatch(
        fetchCustomDesignRequestsByCustomerDetail({
          customerDetailId: customerDetailId,
          page: 1,
          size: 10,
        })
      );
    } else {
      setNotification({
        open: true,
        message:
          "Không thể xác định yêu cầu thiết kế với ID: " + designRequestId,
        severity: "error",
      });
      setConstructionLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchOrdersByUserId(user.id));
      dispatch(fetchCustomerDetailByUserId(user.id)).then((res) => {
        // Redux Toolkit unwraps the promise, so res.payload là kết quả
        const detail = res.payload;
        if (detail && detail.id) {
          setCustomerDetailId(detail.id);
        } else {
          setCustomerDetailId(undefined);
        }
      });
    }
  }, [isAuthenticated, user, dispatch]);

  // Gọi API lấy đơn thiết kế thủ công khi chuyển tab hoặc khi customerDetailId thay đổi
  useEffect(() => {
    console.log(
      "useEffect: isAuthenticated:",
      isAuthenticated,
      "user:",
      user,
      "tab:",
      tab,
      "customerDetailId:",
      customerDetailId
    );
    if (
      isAuthenticated &&
      customerDetailId &&
      tab === 1 // tab 1 là đơn thiết kế thủ công
    ) {
      console.log(
        "Dispatch fetchCustomDesignRequestsByCustomerDetail trong useEffect với customerDetailId:",
        customerDetailId
      );
      dispatch(
        fetchCustomDesignRequestsByCustomerDetail({
          customerDetailId: customerDetailId,
          page: 1,
          size: 10,
        })
      );
    }
  }, [isAuthenticated, user, tab, customerDetailId, dispatch]);

  // Fetch price proposals when openDetail or currentDesignRequest changes
  useEffect(() => {
    if (openDetail && currentDesignRequest) {
      setLoadingProposals(true);
      getPriceProposals(currentDesignRequest.id).then((res) => {
        if (res.success) {
          setPriceProposals(res.result);
        } else {
          setPriceProposals([]);
        }
        setLoadingProposals(false);
      });
    }
  }, [openDetail, currentDesignRequest]);

  const handleDeposit = (order) => {
    navigate("/checkout", {
      state: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        depositAmount: order.depositAmount,
        remainingAmount: order.remainingAmount,
        orderDate: order.orderDate,
        status: order.status,
      },
    });
  };

  const handleApproveProposal = async (proposalId) => {
    setActionLoading(true);
    const res = await approvePriceProposal(proposalId);
    if (res.success) {
      setNotification({
        open: true,
        message: "Chấp nhận báo giá thành công!",
        severity: "success",
      });
      // Reload proposals
      getPriceProposals(currentDesignRequest.id).then(
        (r) => r.success && setPriceProposals(r.result)
      );
    } else {
      setNotification({
        open: true,
        message: res.error || "Chấp nhận báo giá thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  const handleOpenOfferDialog = (proposalId) => {
    setOfferDialog({ open: true, proposalId });
    setOfferForm({
      totalPriceOffer: "",
      depositAmountOffer: "",
      rejectionReason: "",
    });
  };
  const handleCloseOfferDialog = () => {
    setOfferDialog({ open: false, proposalId: null });
  };
  const handleOfferSubmit = async () => {
    setActionLoading(true);
    const { proposalId } = offerDialog;
    // Lấy proposal hiện tại từ priceProposals
    const proposal = priceProposals.find((p) => p.id === proposalId);
    if (!["PENDING", "NEGOTIATING"].includes(proposal?.status)) {
      setNotification({
        open: true,
        message:
          "Không thể offer giá mới vì trạng thái báo giá đã thay đổi. Vui lòng tải lại trang.",
        severity: "error",
      });
      setActionLoading(false);
      return;
    }
    const data = {
      rejectionReason:
        offerForm.rejectionReason || "Khách muốn thương lượng giá",
      totalPriceOffer: Number(offerForm.totalPriceOffer),
      depositAmountOffer: Number(offerForm.depositAmountOffer),
    };
    const res = await offerPriceProposal(proposalId, data);
    if (res.success) {
      setNotification({
        open: true,
        message: "Gửi offer giá mới thành công!",
        severity: "success",
      });
      handleCloseOfferDialog();
      // Reload proposals
      getPriceProposals(currentDesignRequest.id).then(
        (r) => r.success && setPriceProposals(r.result)
      );
    } else {
      setNotification({
        open: true,
        message: res.error || "Gửi offer thất bại",
        severity: "error",
      });
    }
    setActionLoading(false);
  };

  // Hàm xử lý đặt cọc custom design (redirect thẳng)
  const handleCustomDeposit = (customDesignRequestId) => {
    setDepositLoadingId(customDesignRequestId);
    dispatch(payCustomDesignDepositThunk(customDesignRequestId))
      .unwrap()
      .then((res) => {
        setDepositLoadingId(null);
        const checkoutUrl = res.result?.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          setNotification({
            open: true,
            message: res.error || "Không thể tạo link thanh toán",
            severity: "error",
          });
        }
      })
      .catch((err) => {
        setDepositLoadingId(null);
        setNotification({
          open: true,
          message: err || "Không thể tạo link thanh toán",
          severity: "error",
        });
      });
  };

  if (!isAuthenticated) {
    return (
      <Box
        minHeight="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="h6" color="error">
          Vui lòng đăng nhập để xem lịch sử đơn hàng.
        </Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" py={4} px={2}>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Lịch sử đơn hàng" />
        <Tab label="Đơn thiết kế thủ công" />
      </Tabs>
      {tab === 0 ? (
        <>
          {orderLoading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : orderError ? (
            <Typography color="error">{orderError}</Typography>
          ) : orders.length === 0 ? (
            <Typography>Không có đơn hàng nào.</Typography>
          ) : (
            <Stack spacing={2}>
              {orders.map((order) => (
                <Card
                  key={order.id}
                  sx={{
                    borderRadius: 2,
                    boxShadow: 2,
                    borderLeft: order.aiDesigns
                      ? "4px solid #6A1B9A"
                      : order.customDesignRequests
                      ? "4px solid #0277BD"
                      : "4px solid #558B2F",
                  }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ sm: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          mb={1}
                        >
                          {order.aiDesigns ? (
                            <Chip
                              icon={<SmartToyIcon />}
                              label="AI Design"
                              size="small"
                              color="secondary"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : order.customDesignRequests ? (
                            <Chip
                              icon={<BrushIcon />}
                              label="Custom Design"
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 500 }}
                            />
                          ) : (
                            <Chip
                              icon={<ShoppingBagIcon />}
                              label="Đơn hàng thường"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Stack>

                        <Typography fontWeight={600}>
                          Mã đơn: {order.id}
                        </Typography>

                        {order.customDesignRequests && (
                          <Typography color="text.secondary" fontSize={14}>
                            <b>Yêu cầu thiết kế:</b>{" "}
                            {order.customDesignRequests.requirements?.substring(
                              0,
                              50
                            )}
                            {order.customDesignRequests.requirements?.length >
                            50
                              ? "..."
                              : ""}
                          </Typography>
                        )}

                        {order.aiDesigns && (
                          <Typography color="text.secondary" fontSize={14}>
                            <b>Ghi chú:</b>{" "}
                            {order.aiDesigns.customerNote?.substring(0, 50)}
                            {order.aiDesigns.customerNote?.length > 50
                              ? "..."
                              : ""}
                          </Typography>
                        )}

                        <Typography color="text.secondary" fontSize={14}>
                          Ngày đặt:{" "}
                          {new Date(order.orderDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Typography>
                        <Typography color="text.secondary" fontSize={14}>
                          Tổng tiền:{" "}
                          {order.totalAmount?.toLocaleString("vi-VN") || 0}₫
                        </Typography>
                        {order.status === "DEPOSITED" && (
                          <>
                            <Typography color="success.main" fontSize={14}>
                              Đã đặt cọc:{" "}
                              {order.depositAmount?.toLocaleString("vi-VN") ||
                                0}
                              ₫
                            </Typography>
                            <Typography color="info.main" fontSize={14}>
                              Còn lại:{" "}
                              {order.remainingAmount?.toLocaleString("vi-VN") ||
                                0}
                              ₫
                            </Typography>
                          </>
                        )}
                        {order.deliveryDate && (
                          <Typography color="primary.main" fontSize={14}>
                            Ngày giao dự kiến:{" "}
                            {new Date(order.deliveryDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={statusMap[order.status]?.label || order.status}
                          color={statusMap[order.status]?.color || "default"}
                        />
                        
                        {["APPROVED", "CONFIRMED", "PENDING"].includes(
                          (order.status || "").toUpperCase()
                        ) && (
                          <Button
                            variant="contained"
                            color="warning"
                            size="small"
                            onClick={() => handleDeposit(order)}
                          >
                            ĐẶT CỌC
                          </Button>
                        )}
                        {[
                          "CONTRACT_SENT",
                          
                        ].includes((order.status || "").toUpperCase()) && (
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            onClick={() => handleGetContract(order.id)}
                            disabled={contractLoading}
                            startIcon={
                              contractLoading ? (
                                <CircularProgress size={16} />
                              ) : null
                            }
                          >
                            Xem hợp đồng
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </>
      ) : (
        <Stack spacing={2}>
          {customStatus === "loading" ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : customError ? (
            <Typography color="error">{customError}</Typography>
          ) : designRequests.length === 0 ? (
            <Typography>Không có đơn thiết kế nào.</Typography>
          ) : (
            designRequests.map((req) => (
              <Card key={req.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Stack direction="column" spacing={1}>
                    <Box
                      sx={{
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        dispatch(setCurrentDesignRequest(req));
                        setOpenDetail(true);
                      }}
                    >
                      <Typography fontWeight={600}>
                        Yêu cầu: {req.requirements}
                      </Typography>
                      <Typography>
                        Tổng tiền: {req.totalPrice?.toLocaleString("vi-VN")}₫
                      </Typography>
                      <Typography>
                        Đặt cọc: {req.depositAmount?.toLocaleString("vi-VN")}₫
                      </Typography>
                      <Typography>
                        Trạng thái: {statusMap[req.status]?.label || req.status}
                      </Typography>
                      <Typography>
                        Ngày tạo:{" "}
                        {new Date(req.createAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>
                    {/* Hiển thị badge cho trạng thái DEPOSITED */}
                    {req.status === "DEPOSITED" && (
                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip
                          label="Đợi bản demo từ designer"
                          color="success"
                          variant="outlined"
                        />
                      </Stack>
                    )}
                    {/* Nút đặt cọc nếu status là APPROVED_PRICING */}
                    {req.status === "APPROVED_PRICING" && (
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomDeposit(req.id);
                        }}
                        disabled={depositLoadingId === req.id}
                      >
                        {depositLoadingId === req.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Đặt cọc"
                        )}
                      </Button>
                    )}
                    {/* Hiển thị nút lựa chọn thi công trong card khi trạng thái FULLY_PAID và chưa có lựa chọn */}
                    {req.status === "COMPLETED" && // Thay "FULLY_PAID" thành "COMPLETED"
                      req.isNeedSupport === null &&
                      !orders.some(
                        (order) => order.customDesignRequests?.id === req.id
                      ) && (
                        <Box
                          mt={1}
                          p={2}
                          border={1}
                          borderRadius={1}
                          borderColor="primary.light"
                          bgcolor="#e3f2fd"
                        >
                          <Typography variant="body2" fontWeight="bold" mb={1}>
                            Bạn muốn sử dụng dịch vụ thi công?
                          </Typography>
                          <Stack direction="row" spacing={1} mt={1}>
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              disabled={constructionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConstructionChoice(req.id, true);
                              }}
                              startIcon={
                                constructionLoading ? (
                                  <CircularProgress size={16} />
                                ) : null
                              }
                            >
                              Có thi công
                            </Button>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              disabled={constructionLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConstructionChoice(req.id, false);
                              }}
                              startIcon={
                                constructionLoading ? (
                                  <CircularProgress size={16} />
                                ) : null
                              }
                            >
                              Không thi công
                            </Button>
                          </Stack>
                        </Box>
                      )}

                    {/* Hiển thị lựa chọn thi công đã chọn trong card */}
                    {req.status === "COMPLETED" && ( // Thay "FULLY_PAID" thành "COMPLETED"
                      <>
                        {req.isNeedSupport === true &&
                        orders.some(
                          (order) => order.customDesignRequests?.id === req.id
                        ) ? (
                          <Box
                            mt={1}
                            p={2}
                            border={1}
                            borderRadius={1}
                            borderColor="info.light"
                            bgcolor="#e1f5fe"
                          >
                            <Typography variant="body2">
                              <b>Đã chọn thi công:</b> Đơn hàng đã được tạo, vui
                              lòng kiểm tra ở tab "Lịch sử đơn hàng"
                            </Typography>
                          </Box>
                        ) : req.isNeedSupport !== null ? (
                          <Box
                            mt={1}
                            p={2}
                            border={1}
                            borderRadius={1}
                            borderColor="success.light"
                            bgcolor="#e8f5e9"
                          >
                            <Typography variant="body2">
                              <b>Đã chọn:</b>{" "}
                              {req.isNeedSupport
                                ? "Có thi công"
                                : "Không thi công"}
                            </Typography>
                          </Box>
                        ) : null}
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}
      {/* Popup chi tiết custom design request */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Chi tiết yêu cầu thiết kế
          <IconButton
            aria-label="close"
            onClick={() => setOpenDetail(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {currentDesignRequest ? (
            <Box>
              <Typography>
                <b>ID:</b> {currentDesignRequest.id}
              </Typography>
              <Typography>
                <b>Yêu cầu:</b> {currentDesignRequest.requirements}
              </Typography>
              <Typography>
                <b>Tổng tiền:</b>{" "}
                {currentDesignRequest.totalPrice?.toLocaleString("vi-VN") ||
                  "N/A"}
                ₫
              </Typography>
              <Typography>
                <b>Đặt cọc:</b>{" "}
                {currentDesignRequest.depositAmount?.toLocaleString("vi-VN") ||
                  "N/A"}
                ₫
              </Typography>
              <Typography>
                <b>Còn lại:</b>{" "}
                {currentDesignRequest.remainingAmount?.toLocaleString(
                  "vi-VN"
                ) || "N/A"}
                ₫
              </Typography>
              <Typography>
                <b>Trạng thái:</b>{" "}
                {statusMap[currentDesignRequest.status]?.label ||
                  currentDesignRequest.status}
              </Typography>
              <Typography>
                <b>Ngày tạo:</b>{" "}
                {new Date(currentDesignRequest.createAt).toLocaleString(
                  "vi-VN"
                )}
              </Typography>
              <Typography>
                <b>Ngày cập nhật:</b>{" "}
                {new Date(currentDesignRequest.updateAt).toLocaleString(
                  "vi-VN"
                )}
              </Typography>
              <Typography>
                <b>Hỗ trợ:</b>{" "}
                {currentDesignRequest.isNeedSupport === null
                  ? "N/A"
                  : currentDesignRequest.isNeedSupport
                  ? "Có"
                  : "Không"}
              </Typography>
              <Typography>
                <b>Designer phụ trách:</b>{" "}
                {currentDesignRequest.assignDesigner || "Chưa có"}
              </Typography>
              <Typography>
                <b>Ảnh thiết kế cuối:</b>{" "}
                {currentDesignRequest.finalDesignImage ? (
                  <img
                    src={currentDesignRequest.finalDesignImage}
                    alt="final"
                    style={{ maxWidth: 200 }}
                  />
                ) : (
                  "Chưa có"
                )}
              </Typography>
              <Typography mt={2}>
                <b>Thông tin lựa chọn sản phẩm:</b>
              </Typography>
              {currentDesignRequest.customerChoiceHistories && (
                <Box ml={2}>
                  <Typography>
                    <b>Loại sản phẩm:</b>{" "}
                    {
                      currentDesignRequest.customerChoiceHistories
                        .productTypeName
                    }
                  </Typography>
                  <Typography>
                    <b>Công thức tính:</b>{" "}
                    {
                      currentDesignRequest.customerChoiceHistories
                        .calculateFormula
                    }
                  </Typography>
                  <Typography>
                    <b>Tổng tiền:</b>{" "}
                    {currentDesignRequest.customerChoiceHistories.totalAmount?.toLocaleString(
                      "vi-VN"
                    ) || "N/A"}
                    ₫
                  </Typography>
                  <Typography mt={1}>
                    <b>Thuộc tính đã chọn:</b>
                  </Typography>
                  <ul>
                    {currentDesignRequest.customerChoiceHistories.attributeSelections?.map(
                      (attr, idx) => (
                        <li key={idx}>
                          <Typography>
                            <b>{attr.attribute}:</b> {attr.value} | Đơn vị:{" "}
                            {attr.unit} | Giá vật liệu:{" "}
                            {attr.materialPrice?.toLocaleString("vi-VN") || 0}₫
                            | Đơn giá:{" "}
                            {attr.unitPrice?.toLocaleString("vi-VN") || 0}₫ |
                            Công thức: {attr.calculateFormula} | Thành tiền:{" "}
                            {attr.subTotal?.toLocaleString("vi-VN") || 0}₫
                          </Typography>
                        </li>
                      )
                    )}
                  </ul>
                  <Typography mt={1}>
                    <b>Kích thước đã chọn:</b>
                  </Typography>
                  <ul>
                    {currentDesignRequest.customerChoiceHistories.sizeSelections?.map(
                      (size, idx) => (
                        <li key={idx}>
                          <Typography>
                            <b>{size.size}:</b> {size.value}
                          </Typography>
                        </li>
                      )
                    )}
                  </ul>
                </Box>
              )}
              {/* Lịch sử báo giá */}
              <Typography mt={2} variant="h6">
                Lịch sử báo giá
              </Typography>
              {loadingProposals ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress />
                </Box>
              ) : priceProposals.length === 0 ? (
                <Typography>Chưa có báo giá nào.</Typography>
              ) : (
                <Box>
                  {priceProposals.map((proposal) => (
                    <Box
                      key={proposal.id}
                      mb={2}
                      p={2}
                      border={1}
                      borderRadius={2}
                      borderColor="grey.300"
                    >
                      <Typography>
                        <b>Giá báo:</b>{" "}
                        {proposal.totalPrice?.toLocaleString("vi-VN")}₫
                      </Typography>
                      <Typography>
                        <b>Tiền cọc:</b>{" "}
                        {proposal.depositAmount?.toLocaleString("vi-VN")}₫
                      </Typography>
                      {proposal.totalPriceOffer && (
                        <Typography>
                          <b>Giá offer:</b>{" "}
                          {proposal.totalPriceOffer?.toLocaleString("vi-VN")}₫
                        </Typography>
                      )}
                      {proposal.depositAmountOffer && (
                        <Typography>
                          <b>Cọc offer:</b>{" "}
                          {proposal.depositAmountOffer?.toLocaleString("vi-VN")}
                          ₫
                        </Typography>
                      )}
                      <Typography>
                        <b>Trạng thái:</b> {proposal.status}
                      </Typography>
                      <Typography>
                        <b>Ngày báo giá:</b>{" "}
                        {new Date(proposal.createAt).toLocaleString("vi-VN")}
                      </Typography>
                      {/* Nút thao tác nếu trạng thái phù hợp */}
                      {["PENDING", "NEGOTIATING"].includes(proposal.status) && (
                        <Box mt={1} display="flex" gap={2}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            disabled={actionLoading}
                            onClick={() => handleApproveProposal(proposal.id)}
                          >
                            Chấp nhận
                          </Button>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            disabled={actionLoading}
                            onClick={() => handleOpenOfferDialog(proposal.id)}
                          >
                            Offer giá khác
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
              {/* Dialog offer giá khác */}
              <Dialog open={offerDialog.open} onClose={handleCloseOfferDialog}>
                <DialogTitle>Offer giá khác</DialogTitle>
                <DialogContent>
                  <TextField
                    label="Lý do từ chối"
                    fullWidth
                    margin="normal"
                    value={offerForm.rejectionReason}
                    onChange={(e) =>
                      setOfferForm((f) => ({
                        ...f,
                        rejectionReason: e.target.value,
                      }))
                    }
                    required
                  />
                  <TextField
                    label="Giá offer (VND)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={offerForm.totalPriceOffer}
                    onChange={(e) =>
                      setOfferForm((f) => ({
                        ...f,
                        totalPriceOffer: e.target.value,
                      }))
                    }
                  />
                  <TextField
                    label="Tiền cọc offer (VND)"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={offerForm.depositAmountOffer}
                    onChange={(e) =>
                      setOfferForm((f) => ({
                        ...f,
                        depositAmountOffer: e.target.value,
                      }))
                    }
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseOfferDialog}>Hủy</Button>
                  <Button
                    onClick={handleOfferSubmit}
                    variant="contained"
                    color="primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Gửi offer"
                    )}
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          ) : (
            <Typography>Không có dữ liệu.</Typography>
          )}
          {currentDesignRequest &&
            currentDesignRequest.status === "COMPLETED" && // Thay "FULLY_PAID" thành "COMPLETED"
            currentDesignRequest.isNeedSupport === null &&
            !orders.some(
              (order) =>
                order.customDesignRequests?.id === currentDesignRequest.id
            ) && (
              <Box
                mt={2}
                p={2}
                border={1}
                borderRadius={2}
                borderColor="primary.light"
                bgcolor="#e3f2fd"
              >
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Bạn có muốn chọn dịch vụ thi công không?
                </Typography>
                <Stack direction="row" spacing={2} mt={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={constructionLoading}
                    onClick={() =>
                      handleConstructionChoice(currentDesignRequest.id, true)
                    }
                    startIcon={
                      constructionLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    Có thi công
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={constructionLoading}
                    onClick={() =>
                      handleConstructionChoice(currentDesignRequest.id, false)
                    }
                    startIcon={
                      constructionLoading ? (
                        <CircularProgress size={20} />
                      ) : null
                    }
                  >
                    Không thi công
                  </Button>
                </Stack>
              </Box>
            )}
          {/* Hiển thị lựa chọn thi công đã chọn */}
          {currentDesignRequest &&
            currentDesignRequest.status === "COMPLETED" && ( // Thay "FULLY_PAID" thành "COMPLETED"
              <>
                {currentDesignRequest.isNeedSupport === true &&
                orders.some(
                  (order) =>
                    order.customDesignRequests?.id === currentDesignRequest.id
                ) ? (
                  <Box
                    mt={2}
                    p={2}
                    border={1}
                    borderRadius={2}
                    borderColor="info.light"
                    bgcolor="#e1f5fe"
                  >
                    <Typography variant="subtitle1">
                      <b>Đã chọn thi công:</b> Đơn hàng đã được tạo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bạn có thể xem đơn hàng thi công ở tab "Lịch sử đơn hàng"
                    </Typography>
                  </Box>
                ) : currentDesignRequest.isNeedSupport !== null ? (
                  <Box
                    mt={2}
                    p={2}
                    border={1}
                    borderRadius={2}
                    borderColor="success.light"
                    bgcolor="#e8f5e9"
                  >
                    <Typography variant="subtitle1">
                      <b>Bạn đã chọn:</b>{" "}
                      {currentDesignRequest.isNeedSupport
                        ? "Có thi công"
                        : "Không thi công"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Liên hệ với chúng tôi nếu bạn muốn thay đổi lựa chọn
                    </Typography>
                  </Box>
                ) : null}
              </>
            )}
        </DialogContent>
      </Dialog>
       <Dialog
        open={contractDialog.open}
        onClose={handleCloseContractDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Thông tin hợp đồng - Đơn hàng #{contractDialog.orderId}
          <IconButton
            aria-label="close"
            onClick={handleCloseContractDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {contractDialog.contract ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Chi tiết hợp đồng
              </Typography>
              
              <Typography sx={{ mb: 1 }}>
                <b>ID hợp đồng:</b> {contractDialog.contract.id}
              </Typography>
              
              <Typography sx={{ mb: 1 }}>
                <b>Số hợp đồng:</b> {contractDialog.contract.contractNumber || "N/A"}
              </Typography>
              
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography>
                  <b>Trạng thái:</b>
                </Typography>
                <Chip
                  label={CONTRACT_STATUS_MAP[contractDialog.contract.status]?.label || contractDialog.contract.status}
                  color={CONTRACT_STATUS_MAP[contractDialog.contract.status]?.color || "default"}
                  size="small"
                />
              </Stack>
              
              <Typography sx={{ mb: 1 }}>
                <b>Ngày gửi:</b> {contractDialog.contract.sentDate 
                  ? new Date(contractDialog.contract.sentDate).toLocaleString("vi-VN")
                  : "N/A"}
              </Typography>
              
              {contractDialog.contract.signedDate && (
                <Typography sx={{ mb: 1 }}>
                  <b>Ngày ký:</b> {new Date(contractDialog.contract.signedDate).toLocaleString("vi-VN")}
                </Typography>
              )}
              
              {contractDialog.contract.depositPercentChanged && (
                <Typography sx={{ mb: 1 }}>
                  <b>Tỷ lệ đặt cọc thay đổi:</b> {contractDialog.contract.depositPercentChanged}%
                </Typography>
              )}
              
              {/* Hợp đồng gốc */}
              {contractDialog.contract.contractUrl && (
                <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📄 Hợp đồng gốc
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleViewContract(contractDialog.contract.contractUrl, "original")}
                      disabled={contractViewLoading}
                      startIcon={contractViewLoading ? <CircularProgress size={16} /> : null}
                    >
                      Xem hợp đồng
                    </Button>
                    {contractDialog.contract.status === "SENT" && (
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleDiscussContract(contractDialog.contract.id)}
                        disabled={discussLoading}
                        startIcon={discussLoading ? <CircularProgress size={16} /> : null}
                      >
                        Yêu cầu thảo luận
                      </Button>
                    )}
                  </Stack>
                </Box>
              )}
              
              {/* Hợp đồng đã ký */}
              {contractDialog.contract.signedContractUrl && (
                <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'success.main', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    ✅ Hợp đồng đã ký
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleViewContract(contractDialog.contract.signedContractUrl, "signed")}
                      disabled={contractViewLoading}
                      startIcon={contractViewLoading ? <CircularProgress size={16} /> : null}
                    >
                      Xem hợp đồng đã ký
                    </Button>
                   
                  </Stack>
                </Box>
              )}
              
              {/* Status messages */}
              {contractDialog.contract.status === "SENT" && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.dark">
                    📄 Hợp đồng đã được gửi, vui lòng kiểm tra và ký hợp đồng.
                    <br />
                    💬 Nếu có thắc mắc, bạn có thể yêu cầu thảo luận với chúng tôi.
                  </Typography>
                </Box>
              )}
                {contractDialog.contract.status === "DISCUSSING" && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.dark">
                    💬 Yêu cầu thảo luận đã được gửi. Chúng tôi sẽ liên hệ với bạn sớm nhất.
                  </Typography>
                </Box>
              )}
              {contractDialog.contract.status === "SIGNED" && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.dark">
                    ✅ Hợp đồng đã được ký thành công!
                  </Typography>
                </Box>
              )}
              
              {contractDialog.contract.status === "REJECTED" && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="error.dark">
                    ❌ Hợp đồng đã bị từ chối. Vui lòng liên hệ để được hỗ trợ.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Chưa có hợp đồng cho đơn hàng này
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContractDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
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

export default OrderHistory;
