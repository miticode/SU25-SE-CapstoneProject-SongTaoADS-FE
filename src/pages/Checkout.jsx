import React, { useState, useEffect } from "react";
import PageTransition from "../components/PageTransition";
import StepIndicator from "../components/StepIndicator";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchOrderById } from "../store/features/order/orderSlice";
import { payOrderDepositThunk } from "../store/features/payment/paymentSlice";
import { updateOrderAddressApi, getOrdersByUserIdApi } from "../api/orderService";
import { getProfileApi } from "../api/authService";

// Cấu hình bước
const steps = [
  { number: 1, label: "Thông tin cá nhân" },
  { number: 2, label: "Xem lại đơn hàng" },
  { number: 3, label: "Thanh toán" },
];

// Phương thức thanh toán
const paymentMethods = [
  {
    value: "payos",
    label: "PAYOS",
    icon: (
      <img
        src="https://payos.vn/docs/img/logo.svg"
        alt="PAYOS"
        width={32}
        height={32}
      />
    ),
  },
];

// Helper hiển thị thông tin tài chính & đơn hàng
const renderOrderFinancialSection = (order) => (
  <div className="space-y-6">
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 text-sm sm:text-base">
        <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
        <span className="font-semibold break-all text-right">{order.orderCode || order.id}</span>
      </div>
      <div className="flex items-start justify-between gap-4 text-sm sm:text-base">
        <span className="text-slate-500 font-medium">Loại đơn hàng:</span>
        <span className="font-semibold text-sky-600">{order.orderType === "AI_DESIGN" ? "AI Design" : order.orderType}</span>
      </div>
    </div>
    <hr className="border-slate-200" />
    <h3 className="text-base sm:text-lg font-semibold text-emerald-700 flex items-center gap-2">Chi tiết tài chính</h3>
    <div className="space-y-2">
      <div className="flex justify-between text-sm sm:text-base font-medium">
        <span>💰 Tổng đơn hàng:</span>
        <span className="text-green-600 font-bold">{order.totalOrderAmount?.toLocaleString("vi-VN") || order.totalAmount?.toLocaleString("vi-VN")} VND</span>
      </div>
      <div className="flex justify-between text-sm sm:text-base font-medium">
        <span>🟡 Tiền cọc (tổng):</span>
        <span className="text-amber-600">{order.totalOrderDepositAmount?.toLocaleString("vi-VN") || order.depositAmount?.toLocaleString("vi-VN")} VND</span>
      </div>
      <div className="flex justify-between text-sm sm:text-base font-medium">
        <span>🔄 Số tiền còn lại:</span>
        <span className="text-rose-600">{order.totalOrderRemainingAmount?.toLocaleString("vi-VN")}</span>
      </div>
    </div>
    <div className="pt-4">
      <h4 className="font-semibold text-sky-600 mb-2">🔨 Chi phí thi công</h4>
      <div className="space-y-1 text-sm sm:text-base pl-1">
        <div className="flex justify-between"><span className="text-slate-500">Tổng:</span><span className="font-medium">{order.totalConstructionAmount?.toLocaleString("vi-VN")} VND</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Đã cọc:</span><span className="font-medium text-green-600">{order.depositConstructionAmount?.toLocaleString("vi-VN")} VND</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Còn lại:</span><span className="font-medium text-amber-600">{order.remainingConstructionAmount?.toLocaleString("vi-VN")} VND</span></div>
      </div>
    </div>
    <div className="pt-2">
      <h4 className="font-semibold text-violet-600 mb-2">🎨 Chi phí thiết kế</h4>
      <div className="space-y-1 text-sm sm:text-base pl-1">
        <div className="flex justify-between"><span className="text-slate-500">Tổng:</span><span className="font-medium">{order.totalDesignAmount?.toLocaleString("vi-VN")} VND</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Đã cọc:</span><span className="font-medium text-green-600">{order.depositDesignAmount?.toLocaleString("vi-VN")} VND</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Còn lại:</span><span className="font-medium text-amber-600">{order.remainingDesignAmount?.toLocaleString("vi-VN")} VND</span></div>
      </div>
    </div>
    <div className="pt-4 space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-sky-700">Thông tin giao hàng</h3>
      <div className="flex justify-between gap-4 text-sm sm:text-base">
        <span className="text-slate-500">📍 Địa chỉ:</span>
        <span className="font-medium text-right max-w-xs break-words">{order.address || "Chưa có địa chỉ"}</span>
      </div>
      {order.estimatedDeliveryDate && (
        <div className="flex justify-between gap-4 text-sm sm:text-base">
          <span className="text-slate-500">🚚 Ngày giao dự kiến:</span>
          <span className="font-medium">{new Date(order.estimatedDeliveryDate).toLocaleDateString("vi-VN")}</span>
        </div>
      )}
      {order.note && (
        <div className="flex justify-between gap-4 text-sm sm:text-base">
          <span className="text-slate-500">📝 Ghi chú:</span>
          <span className="font-medium text-right max-w-xs break-words">{order.note}</span>
        </div>
      )}
    </div>
    {order.users && (
      <div className="pt-4 space-y-2">
        <h3 className="text-base sm:text-lg font-semibold text-sky-600">Thông tin khách hàng</h3>
        <div className="flex justify-between text-sm sm:text-base"><span className="text-slate-500">👤 Họ tên:</span><span className="font-medium">{order.users.fullName}</span></div>
        <div className="flex justify-between text-sm sm:text-base"><span className="text-slate-500">📧 Email:</span><span className="font-medium break-all">{order.users.email}</span></div>
        {order.users.phone && <div className="flex justify-between text-sm sm:text-base"><span className="text-slate-500">📱 SĐT:</span><span className="font-medium">{order.users.phone}</span></div>}
      </div>
    )}
    <div className="pt-4 space-y-1">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Thời gian</h4>
      <div className="flex justify-between text-xs sm:text-sm"><span className="text-slate-500">Tạo:</span><span>{new Date(order.createdAt).toLocaleString("vi-VN")}</span></div>
      <div className="flex justify-between text-xs sm:text-sm"><span className="text-slate-500">Cập nhật:</span><span>{new Date(order.updatedAt).toLocaleString("vi-VN")}</span></div>
    </div>
    {order.customDesignRequests?.finalDesignImage && (
      <div className="pt-4">
        <h3 className="text-base sm:text-lg font-semibold text-violet-600 mb-2">🎨 Thiết kế cuối cùng</h3>
        <img
          onClick={() => window.open(order.customDesignRequests.finalDesignImage, "_blank")}
          src={order.customDesignRequests.finalDesignImage}
          alt="Thiết kế cuối cùng"
          className="w-full max-w-sm rounded-lg border-2 border-slate-200 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
        />
        {order.customDesignRequests.requirements && (
          <p className="text-xs sm:text-sm text-slate-600 mt-2"><strong>Yêu cầu:</strong> {order.customDesignRequests.requirements}</p>
        )}
      </div>
    )}
  </div>
);

const Checkout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux selectors
  const currentOrder = useSelector((state) => state.order.currentOrder);
  const currentOrderStatus = useSelector((state) => state.order.currentOrderStatus);
  const currentOrderError = useSelector((state) => state.order.currentOrderError);
  const paymentLoading = useSelector((state) => state.payment.loading);
  const paymentError = useSelector((state) => state.payment.error);
  // Có thể dùng thêm paymentSuccess, orderDepositResult nếu cần hiển thị sau thanh toán

  // Local state
  const [currentStep, setCurrentStep] = useState(1);
  const [customer, setCustomer] = useState({ address: "", note: "" });
  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("payos");
  const [orderId, setOrderId] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [updatedOrderInfo, setUpdatedOrderInfo] = useState(null);

  // Input handler
  const handleInputChange = (e) => {
    setCustomer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Step navigation logic
  const handleNext = async () => {
    if (currentStep === 1) {
      try {
        if (!orderId) throw new Error("Không tìm thấy orderId!");
        const result = await updateOrderAddressApi(orderId, {
          address: customer.address,
          note: customer.note,
        });
        const updatedData = result.result || result.data;
        if (!result.success || !updatedData) throw new Error(result.error || "Cập nhật địa chỉ thất bại");
        setUpdatedOrderInfo(updatedData);
        setCurrentStep(2);
      } catch (err) {
        alert(err.message || "Cập nhật địa chỉ thất bại!");
        console.error("Lỗi cập nhật địa chỉ:", err);
      }
    } else if (currentStep === 2) {
      if (orderId) dispatch(fetchOrderById(orderId));
      setCurrentStep(3);
    }
  };
  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Payment handler
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!agree) return;
    const orderToUse = currentOrder || updatedOrderInfo || orderInfo;
    if (!orderToUse) {
      alert("Không tìm thấy thông tin đơn hàng!");
      return;
    }
    try {
      const result = await dispatch(payOrderDepositThunk(orderToUse.id));
      if (payOrderDepositThunk.fulfilled.match(result)) {
        let checkoutUrl = null;
        if (result.payload?.checkoutUrl) checkoutUrl = result.payload.checkoutUrl;
        else if (result.payload?.data?.checkoutUrl) checkoutUrl = result.payload.data.checkoutUrl;
        else if (result.payload?.result?.checkoutUrl) checkoutUrl = result.payload.result.checkoutUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else throw new Error("Không nhận được URL thanh toán từ PayOS");
      } else {
        const errorMessage = result.payload || "Không thể tạo link thanh toán PayOS";
        alert(errorMessage);
      }
    } catch (err) {
      console.error("[Payment] Lỗi chi tiết:", err);
      alert(err.message || "Có lỗi xảy ra khi thanh toán");
    }
  };

  // Effects
  useEffect(() => {
    if (paymentError) alert(`Lỗi thanh toán: ${paymentError}`);
  }, [paymentError]);

  useEffect(() => {
    if (currentStep === 2 && orderId && !currentOrder) dispatch(fetchOrderById(orderId));
  }, [currentStep, orderId, currentOrder, dispatch]);

  useEffect(() => {
    if (location.state?.orderId && location.state?.orderInfo) {
      setOrderId(location.state.orderId);
      setOrderInfo(location.state.orderInfo);
      setCustomer({
        address: location.state.orderInfo.address || "",
        note: location.state.orderInfo.note || "",
      });
      return;
    }
    const checkoutOrderId = localStorage.getItem("checkoutOrderId");
    const checkoutOrderInfo = localStorage.getItem("checkoutOrderInfo");
    if (checkoutOrderId && checkoutOrderInfo) {
      const parsedOrderInfo = JSON.parse(checkoutOrderInfo);
      setOrderId(checkoutOrderId);
      setOrderInfo(parsedOrderInfo);
      setCustomer({ address: parsedOrderInfo.address || "", note: parsedOrderInfo.note || "" });
      return;
    }
    getProfileApi().then((profileRes) => {
      if (profileRes.success && profileRes.data?.id) {
        const userId = profileRes.data.id;
        localStorage.setItem("userId", userId);
        getOrdersByUserIdApi(userId).then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length) {
            const pendingOrder = res.data.find((o) => o.status === "PENDING");
            const selectedOrder = pendingOrder || res.data[0];
            setOrderId(selectedOrder.id);
            setOrderInfo(selectedOrder);
            setCustomer({ address: selectedOrder.address || "", note: selectedOrder.note || "" });
          } else {
            setOrderInfo(null);
          }
        });
      } else {
        setOrderInfo(null);
      }
    });
  }, [location.state]);

  const orderForStep2 = currentOrder || updatedOrderInfo || orderInfo;
  const isLoadingOrder = currentOrderStatus === "loading";
  const isErrorOrder = currentOrderStatus === "failed";

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-8 px-2 sm:px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-8 transition-all">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-bold text-lg sm:text-xl">1. Nhập địa chỉ nhận hàng và ghi chú</h2>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-600">Địa chỉ nhận hàng *</label>
                        <input type="text" name="address" value={customer.address} onChange={handleInputChange} required placeholder="Nhập địa chỉ giao hàng đầy đủ" className="w-full rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 px-4 py-2.5 text-sm sm:text-base transition outline-none" />
                        <p className="text-xs text-slate-500">Vui lòng nhập địa chỉ chi tiết để chúng tôi có thể giao hàng chính xác</p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-600">Ghi chú đơn hàng</label>
                        <textarea name="note" value={customer.note} onChange={handleInputChange} rows={3} placeholder="Nhập ghi chú (không bắt buộc)" className="w-full rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 px-4 py-2.5 text-sm sm:text-base transition outline-none resize-y" />
                        <p className="text-xs text-slate-500">Ví dụ: Giao giờ hành chính, gọi trước khi giao...</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button onClick={handleNext} disabled={!customer.address.trim()} className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold shadow hover:bg-sky-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">Tiếp tục</button>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-bold text-lg sm:text-xl">2. Xem lại đơn hàng</h2>
                    {isLoadingOrder && (
                      <div className="flex items-center justify-center gap-3 py-6">
                        <span className="h-5 w-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                        <span className="text-sm text-slate-600">Đang tải thông tin đơn hàng...</span>
                      </div>
                    )}
                    {isErrorOrder && (
                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-center text-rose-600 text-sm font-medium">Lỗi: {currentOrderError || "Không thể tải thông tin đơn hàng"}</div>
                    )}
                    {orderForStep2 && !isLoadingOrder && (
                      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-5">
                        <h3 className="text-lg font-semibold text-sky-700">Thông tin đơn hàng</h3>
                        {renderOrderFinancialSection(orderForStep2)}
                      </div>
                    )}
                    <div className="flex justify-end gap-3 flex-wrap">
                      <button onClick={handleBack} className="px-5 py-2.5 rounded-lg border border-sky-200 text-sky-700 bg-white hover:bg-sky-50 text-sm font-semibold cursor-pointer transition">Quay lại</button>
                      <button onClick={handleNext} disabled={isLoadingOrder} className="px-5 py-2.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">Tiếp tục thanh toán</button>
                    </div>
                  </div>
                )}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="font-bold text-lg sm:text-xl">3. Chọn phương thức thanh toán</h2>
                    {(currentOrder || updatedOrderInfo || orderInfo) && (
                      <div className="p-4 rounded-xl border bg-sky-50 border-sky-100 space-y-3">
                        <h4 className="text-sm font-semibold text-sky-700 uppercase tracking-wide">Tóm tắt thanh toán</h4>
                        <div className="space-y-2 text-sm sm:text-base">
                          <div className="flex justify-between"><span className="text-slate-500">Mã đơn hàng:</span><span className="font-medium">{(currentOrder || updatedOrderInfo || orderInfo)?.orderCode || (currentOrder || updatedOrderInfo || orderInfo)?.id}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Số tiền cọc:</span><span className="font-semibold text-amber-600 text-base">{(currentOrder || updatedOrderInfo || orderInfo)?.totalOrderDepositAmount?.toLocaleString("vi-VN") || (currentOrder || updatedOrderInfo || orderInfo)?.depositAmount?.toLocaleString("vi-VN")} VND</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">Tổng giá trị:</span><span className="font-medium text-green-600">{(currentOrder || updatedOrderInfo || orderInfo)?.totalOrderAmount?.toLocaleString("vi-VN") || (currentOrder || updatedOrderInfo || orderInfo)?.totalAmount?.toLocaleString("vi-VN")} VND</span></div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4">
                      {paymentMethods.map((m) => {
                        const active = paymentMethod === m.value;
                        return (
                          <label key={m.value} className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl border transition text-sm font-medium min-w-[140px] ${active ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <input type="radio" name="payment" value={m.value} checked={active} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                            {m.icon}
                            <span>{m.label}</span>
                          </label>
                        );
                      })}
                    </div>
                    <label className="flex items-start gap-2 text-sm cursor-pointer select-none">
                      <input type="checkbox" className="mt-[3px] h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                      <span> Tôi đồng ý với các <a href="#" className="text-sky-600 underline">điều khoản sử dụng</a></span>
                    </label>
                    {paymentLoading && (
                      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-3 text-amber-700 text-sm">
                        <span className="h-5 w-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                        <span>Đang xử lý thanh toán...</span>
                      </div>
                    )}
                    {(() => {
                      const order = currentOrder || updatedOrderInfo || orderInfo;
                      const statuses = ["PENDING", "CONTRACT_CONFIRMED"];
                      const canPay = order && statuses.includes(order.status);
                      return (
                        <div className="flex justify-end gap-3 flex-wrap">
                          <button onClick={handleBack} disabled={paymentLoading} className="px-5 py-2.5 rounded-lg border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Quay lại</button>
                          <button onClick={handlePayment} disabled={paymentLoading || !agree || !order || !canPay} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 text-white text-sm font-semibold shadow hover:from-sky-700 hover:to-cyan-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">{paymentLoading && <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />}<span>{paymentLoading ? "Đang xử lý..." : "Thanh toán"}</span></button>
                        </div>
                      );
                    })()}
                    {(() => {
                      const order = currentOrder || updatedOrderInfo || orderInfo;
                      const statuses = ["PENDING", "CONTRACT_CONFIRMED"];
                      const canPay = order && statuses.includes(order.status);
                      if (order && !canPay) return <p className="text-sm text-rose-600">Đơn hàng ở trạng thái "{order.status}" không thể thanh toán. Chỉ hỗ trợ: {statuses.join(", ")}</p>;
                      return null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
