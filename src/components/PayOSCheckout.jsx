import React, { forwardRef, useImperativeHandle } from "react";
import { usePayOS } from "payos-checkout";

const PayOSCheckout = forwardRef(({ checkoutUrl }, ref) => {
  const payOSConfig = {
    RETURN_URL: "http://localhost:8080/api/orders/payment-success",
    ELEMENT_ID: "payos-checkout-container",
    CHECKOUT_URL: checkoutUrl,
    embedded: false,
    onSuccess: () => {
      window.location.href = "/payment/success";
    },
    onCancel: () => {
      window.location.href = "/payment/cancel";
    },
    onExit: () => {
      // Xử lý khi đóng popup nếu muốn
    },
  };

  const { open } = usePayOS(payOSConfig);

  useImperativeHandle(ref, () => ({
    open,
  }));

  return <div id="payos-checkout-container" style={{ minHeight: 500 }}></div>;
});

export default PayOSCheckout;
