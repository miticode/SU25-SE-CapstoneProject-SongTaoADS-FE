import React, { useState, useEffect } from 'react';
import { FaRedo } from 'react-icons/fa';
import Button from '@mui/material/Button';

const CountdownTimer = ({ 
  initialSeconds = 60, 
  onResend, 
  isResendLoading = false,
  showResendButton = true,
  className = "" 
}) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [showResend, setShowResend] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
      setShowResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountdownActive]);

  // Reset countdown when initialSeconds changes
  useEffect(() => {
    setCountdown(initialSeconds);
    setIsCountdownActive(true);
    setShowResend(false);
  }, [initialSeconds]);

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle resend - chỉ gọi callback, không tự xử lý
  const handleResend = async () => {
    if (onResend && !isResendLoading) {
      await onResend();
      // Không reset countdown ở đây nữa vì sẽ được xử lý bởi component cha
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Countdown timer - luôn hiển thị */}
      <div className="flex items-center justify-center space-x-2">
        <div className="text-sm text-gray-600">Thời gian còn lại:</div>
        <div className={`text-lg font-bold px-3 py-1 rounded-lg ${
          countdown > 0 
            ? "text-red-600 bg-red-100" 
            : "text-gray-600 bg-gray-100"
        }`}>
          {formatTime(countdown)}
        </div>
      </div>
      
      {/* Resend button */}
      {showResendButton && showResend && (
        <div className="flex items-center justify-center">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<FaRedo />}
            onClick={handleResend}
            disabled={isResendLoading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {isResendLoading ? "Đang gửi..." : "Gửi lại mã xác minh"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer; 