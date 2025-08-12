import React from 'react';
import {
  Assignment,
  Send,
  Create,
  Forum,
  Refresh,
  CheckCircle,
  AccountBalance,
  PlayArrow
} from '@mui/icons-material';

const OrderProgressBar = ({ status, order, compact = false }) => {
  // Định nghĩa các bước trong quá trình đơn hàng
  const steps = [
    { 
      key: 'PENDING_CONTRACT', 
      label: compact ? 'Chờ HĐ' : 'Chờ hợp đồng',
      shortLabel: 'Chờ HĐ',
      description: 'Đơn hàng đang chờ tạo hợp đồng',
      icon: Assignment
    },
    { 
      key: 'CONTRACT_SENT', 
      label: compact ? 'Đã gửi HĐ' : 'Đã gửi hợp đồng',
      shortLabel: 'Đã gửi',
      description: 'Hợp đồng đã được gửi cho khách hàng',
      icon: Send
    },
    { 
      key: 'CONTRACT_SIGNED', 
      label: compact ? 'Đã ký HĐ' : 'Đã ký hợp đồng',
      shortLabel: 'Đã ký',
      description: 'Khách hàng đã ký hợp đồng',
      icon: Create
    },
    { 
      key: 'CONTRACT_PROCESSING', // Gom CONTRACT_DISCUSS và CONTRACT_RESIGNED
      label: compact ? 'Đang xử lý' : 'Đang xử lý hợp đồng',
      shortLabel: 'Đang xử lý',
      description: 'Đang xử lý và thảo luận điều khoản hợp đồng',
      icon: Forum
    },
    { 
      key: 'CONTRACT_CONFIRMED', 
      label: compact ? 'Xác nhận HĐ' : 'Xác nhận hợp đồng',
      shortLabel: 'Xác nhận',
      description: 'Hợp đồng đã được xác nhận',
      icon: CheckCircle
    },
    { 
      key: 'DEPOSITED', 
      label: compact ? 'Đã cọc' : 'Đã đặt cọc',
      shortLabel: 'Đã cọc',
      description: 'Khách hàng đã thanh toán cọc',
      icon: AccountBalance
    },
    { 
      key: 'IN_PROGRESS', 
      label: compact ? 'Thi công' : 'Bắt đầu thực hiện',
      shortLabel: 'Bắt đầu ',
      description: 'Đơn hàng bắt đầu được thực hiện',
      icon: PlayArrow
    },
  ];

  // Tìm index của trạng thái hiện tại
  const getCurrentStepKey = () => {
    // Map CONTRACT_DISCUSS và CONTRACT_RESIGNED thành CONTRACT_PROCESSING
    if (status === 'CONTRACT_DISCUSS' || status === 'CONTRACT_RESIGNED') {
      return 'CONTRACT_PROCESSING';
    }
    return status;
  };

  const currentStepKey = getCurrentStepKey();
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);
  
  // Nếu không tìm thấy trạng thái trong danh sách, không hiển thị progress bar
  if (currentStepIndex === -1) return null;

  // Xử lý logic hiển thị cho các trạng thái đặc biệt
  const getVisibleSteps = () => {
    // Trả về tất cả steps vì đã gom CONTRACT_DISCUSS và CONTRACT_RESIGNED
    return [...steps];
  };

  const visibleSteps = getVisibleSteps();
  const activeStepIndex = visibleSteps.findIndex(step => step.key === currentStepKey);

  // Xác định các step đã hoàn thành
  const getCompletedSteps = () => {
    const completed = new Set();
    
    switch (currentStepKey) {
      case 'PENDING_CONTRACT':
        break;
      case 'CONTRACT_SENT':
        completed.add('PENDING_CONTRACT');
        break;
      case 'CONTRACT_SIGNED':
        completed.add('PENDING_CONTRACT');
        completed.add('CONTRACT_SENT');
        break;
      case 'CONTRACT_PROCESSING': // Bao gồm CONTRACT_DISCUSS và CONTRACT_RESIGNED
        completed.add('PENDING_CONTRACT');
        completed.add('CONTRACT_SENT');
        break;
      case 'CONTRACT_CONFIRMED':
        completed.add('PENDING_CONTRACT');
        completed.add('CONTRACT_SENT');
        // Nếu đã qua bước xử lý hoặc đã ký
        if (status === 'CONTRACT_DISCUSS' || status === 'CONTRACT_RESIGNED') {
          completed.add('CONTRACT_PROCESSING');
        } else {
          completed.add('CONTRACT_SIGNED');
        }
        break;
      case 'DEPOSITED':
        completed.add('PENDING_CONTRACT');
        completed.add('CONTRACT_SENT');
        completed.add('CONTRACT_SIGNED');
        completed.add('CONTRACT_CONFIRMED');
        break;
      case 'IN_PROGRESS':
        completed.add('PENDING_CONTRACT');
        completed.add('CONTRACT_SENT');
        completed.add('CONTRACT_SIGNED');
        completed.add('CONTRACT_CONFIRMED');
        completed.add('DEPOSITED');
        break;
      default:
        break;
    }
    
    return completed;
  };

  const completedSteps = getCompletedSteps();

  // Render step circle
  const renderStepCircle = (step, index, isCompleted, isActive) => {
    const IconComponent = step.icon;
    
    return (
      <div className="flex flex-col items-center flex-1 relative">
        {/* Step Circle */}
        <div className={`
          relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 
          rounded-full flex items-center justify-center 
          text-white text-sm sm:text-base lg:text-lg
          border-2 border-white shadow-md transition-all duration-300 z-10
          ${isCompleted 
            ? 'bg-green-500 hover:bg-green-600' 
            : isActive 
            ? 'bg-blue-500 hover:bg-blue-600 ring-4 ring-blue-200' 
            : 'bg-gray-400'
          }
        `}>
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          ) : (
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          )}
        </div>

        {/* Step Label */}
        <div className="mt-2 text-center max-w-[80px] sm:max-w-[100px] lg:max-w-[120px] z-10 relative">
          <span className={`
            text-xs sm:text-sm font-medium block leading-tight
            ${isCompleted 
              ? 'text-green-600' 
              : isActive 
              ? 'text-blue-600' 
              : 'text-gray-500'
            }
          `}>
            {/* Mobile: short label, Desktop: full label */}
            <span className="sm:hidden">{step.shortLabel}</span>
            <span className="hidden sm:inline lg:hidden">{step.label}</span>
            <span className="hidden lg:inline">{step.label}</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className={`
      w-full bg-white rounded-lg border border-gray-200 shadow-sm mb-4
      ${compact ? 'p-3' : 'p-4 sm:p-6'}
    `}>
      {!compact && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-1">
            Tiến độ đơn hàng
          </h3>
          <p className="text-sm text-gray-600">
            Theo dõi quá trình xử lý từ hợp đồng đến bắt đầu thực hiện
          </p>
        </div>
      )}
      
      {/* Progress Steps */}
      <div className="relative px-4">
        <div className={`
          relative flex justify-between items-start
          ${visibleSteps.length > 6 ? 'gap-2 sm:gap-4' : 'gap-4 sm:gap-8'}
        `}>
          {visibleSteps.map((step, index) => {
            const isCompleted = completedSteps.has(step.key);
            const isActive = step.key === currentStepKey;
            const isNextCompleted = index < activeStepIndex;
            
            return (
              <div key={step.key} className="flex-1 relative min-w-0">
                {/* Connecting Line to Next Step */}
                {index < visibleSteps.length - 1 && (
                  <div className="absolute top-4 sm:top-5 lg:top-6 left-1/2 w-full h-0.5 flex">
                    <div className={`flex-1 h-full ${isNextCompleted ? 'bg-green-500' : 'bg-gray-300'} transition-all duration-300`}></div>
                  </div>
                )}
                
                {renderStepCircle(step, index, isCompleted, isActive)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Information */}
      {!compact && (
        <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-sm font-medium text-gray-700">Trạng thái hiện tại:</span>
              <span className="text-sm text-gray-600">
                {visibleSteps[activeStepIndex]?.description || 'Không xác định'}
              </span>
            </div>
            
            {order?.estimatedDeliveryDate && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium text-gray-700">Ngày giao dự kiến:</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderProgressBar;
