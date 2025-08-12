import React, { useState, useEffect, useRef } from 'react';
import { FaRedo } from 'react-icons/fa';
import Button from '@mui/material/Button';

const CountdownTimer = ({ 
  initialSeconds = 60, 
  onResend, 
  isResendLoading = false,
  showResendButton = true,
  className = "",
  timerKey = "default"
}) => {
  const [countdown, setCountdown] = useState(initialSeconds);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [showResend, setShowResend] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const timerRef = useRef(null);

  // Khởi tạo countdown từ localStorage hoặc bắt đầu mới
  useEffect(() => {
    if (isInitialized) return;

    const savedEndTime = localStorage.getItem(`countdown_end_${timerKey}`);
    
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime);
      const currentTime = Date.now();
      const remainingTime = Math.ceil((endTime - currentTime) / 1000);
      
      if (remainingTime > 0) {
        setCountdown(remainingTime);
        setIsCountdownActive(true);
        setShowResend(false);
        console.log(`Khôi phục countdown: ${remainingTime}s còn lại`);
      } else {
        setCountdown(0);
        setIsCountdownActive(false);
        setShowResend(true);
        localStorage.removeItem(`countdown_end_${timerKey}`);
      }
    } else {
      setCountdown(initialSeconds);
      setIsCountdownActive(true);
      setShowResend(false);
      const endTime = Date.now() + (initialSeconds * 1000);
      localStorage.setItem(`countdown_end_${timerKey}`, endTime.toString());
    }
    
    setIsInitialized(true);
  }, [initialSeconds, timerKey, isInitialized]);

  // Countdown timer effect
  useEffect(() => {
    if (!isInitialized) return;

    if (isCountdownActive && countdown > 0) {
      timerRef.current = setTimeout(() => {
        const newCountdown = countdown - 1;
        setCountdown(newCountdown);
        
        if (newCountdown === 0) {
          setIsCountdownActive(false);
          setShowResend(true);
          localStorage.removeItem(`countdown_end_${timerKey}`);
        }
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [countdown, isCountdownActive, timerKey, isInitialized]);

  // Reset countdown function
  const resetCountdown = () => {
    setCountdown(initialSeconds);
    setIsCountdownActive(true);
    setShowResend(false);
    const endTime = Date.now() + (initialSeconds * 1000);
    localStorage.setItem(`countdown_end_${timerKey}`, endTime.toString());
  };

  // Format countdown time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle resend
  const handleResend = async () => {
    if (onResend && !isResendLoading) {
      await onResend();
      resetCountdown();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
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