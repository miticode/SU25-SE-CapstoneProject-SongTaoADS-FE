import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { usePayOS } from "payos-checkout";
import { Alert, Snackbar } from "@mui/material";

const PayOSCheckout = forwardRef(
  ({ checkoutUrl, onSuccess, onCancel, onExit }, ref) => {
    const [error, setError] = useState(null);

    useEffect(() => {
      // Xóa lỗi khi component unmount
      return () => setError(null);
    }, []);

    const payOSConfig = {
      RETURN_URL: "http://localhost:8080/api/orders/payment-success",
      ELEMENT_ID: "payos-checkout-container",
      CHECKOUT_URL: checkoutUrl,
      embedded: false,
      onSuccess: () => {
        if (onSuccess) onSuccess();
        window.location.href = "/payment/success";
      },
      onCancel: () => {
        if (onCancel) onCancel();
        window.location.href = "/payment/cancel";
      },
      onExit: () => {
        if (onExit) onExit();
      },
      onError: (error) => {
        console.error("PayOS Error:", error);
        setError(error.message || "Có lỗi xảy ra khi thanh toán");
      },
    };

    const { open } = usePayOS(payOSConfig);

    useImperativeHandle(ref, () => ({
      open: () => {
        try {
          if (!checkoutUrl) {
            throw new Error("Không tìm thấy URL thanh toán");
          }
          open();
        } catch (error) {
          setError(error.message);
        }
      },
    }));

    const handleCloseError = () => {
      setError(null);
    };

    return (
      <>
        <div
          id="payos-checkout-container"
          style={{
            minHeight: 500,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!checkoutUrl && (
            <Alert severity="warning">Đang tải thông tin thanh toán...</Alert>
          )}
        </div>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </>
    );
  }
);

export default PayOSCheckout;
