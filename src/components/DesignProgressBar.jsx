import React from 'react';
import {
  DesignServices,
  AccountBalance,
  Payment,
  MonetizationOn,
  HourglassEmpty,
  CheckCircle,
} from '@mui/icons-material';

const DesignProgressBar = ({ status, order, compact = false }) => {
  // Định nghĩa các bước trong quá trình thiết kế
  const steps = [
    { 
      key: 'PENDING_DESIGN', 
      label: compact ? 'Chờ thiết kế' : 'Chờ thiết kế',
      shortLabel: 'Chờ TK',
      description: 'Đang chờ bắt đầu quá trình thiết kế',
      icon: DesignServices
    },
    { 
      key: 'NEED_DEPOSIT_DESIGN', 
      label: compact ? 'Cần cọc TK' : 'Cần đặt cọc thiết kế',
      shortLabel: 'Cần cọc',
      description: 'Cần thanh toán cọc để bắt đầu thiết kế',
      icon: AccountBalance
    },
    { 
      key: 'DEPOSITED_DESIGN', 
      label: compact ? 'Đã cọc TK' : 'Đã cọc thiết kế',
      shortLabel: 'Đã cọc',
      description: 'Đã thanh toán cọc thiết kế, bắt đầu thiết kế',
      icon: Payment
    },
    { 
      key: 'NEED_FULLY_PAID_DESIGN', 
      label: compact ? 'Cần TT đủ' : 'Cần thanh toán đủ',
      shortLabel: 'Cần TT',
      description: 'Cần thanh toán đầy đủ để hoàn thành thiết kế',
      icon: MonetizationOn
    },
    { 
      key: 'WAITING_FINAL_DESIGN', 
      label: compact ? 'Chờ hoàn thiện' : 'Chờ hoàn thiện thiết kế',
      shortLabel: 'Chờ HT',
      description: 'Đang hoàn thiện thiết kế cuối cùng',
      icon: HourglassEmpty
    },
    { 
      key: 'DESIGN_COMPLETED', 
      label: compact ? 'Hoàn thành' : 'Thiết kế hoàn thành',
      shortLabel: 'Hoàn thành',
      description: 'Thiết kế đã hoàn thành',
      icon: CheckCircle
    },
  ];

  // Tìm index của trạng thái hiện tại
  const getCurrentStepKey = () => {
    return status;
  };

  const currentStepKey = getCurrentStepKey();
  const currentStepIndex = steps.findIndex(step => step.key === currentStepKey);
  
  // Nếu không tìm thấy trạng thái trong danh sách, không hiển thị progress bar
  if (currentStepIndex === -1) return null;

  // Xử lý logic hiển thị
  const getVisibleSteps = () => {
    return [...steps];
  };

  const visibleSteps = getVisibleSteps();
  const activeStepIndex = visibleSteps.findIndex(step => step.key === currentStepKey);

  // Xác định các step đã hoàn thành
  const getCompletedSteps = () => {
    const completed = new Set();
    
    switch (currentStepKey) {
      case 'PENDING_DESIGN':
        break;
      case 'NEED_DEPOSIT_DESIGN':
        completed.add('PENDING_DESIGN');
        break;
      case 'DEPOSITED_DESIGN':
        completed.add('PENDING_DESIGN');
        completed.add('NEED_DEPOSIT_DESIGN');
        break;
      case 'NEED_FULLY_PAID_DESIGN':
        completed.add('PENDING_DESIGN');
        completed.add('NEED_DEPOSIT_DESIGN');
        completed.add('DEPOSITED_DESIGN');
        break;
      case 'WAITING_FINAL_DESIGN':
        completed.add('PENDING_DESIGN');
        completed.add('NEED_DEPOSIT_DESIGN');
        completed.add('DEPOSITED_DESIGN');
        completed.add('NEED_FULLY_PAID_DESIGN');
        break;
      case 'DESIGN_COMPLETED':
        completed.add('PENDING_DESIGN');
        completed.add('NEED_DEPOSIT_DESIGN');
        completed.add('DEPOSITED_DESIGN');
        completed.add('NEED_FULLY_PAID_DESIGN');
        completed.add('WAITING_FINAL_DESIGN');
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
            ? 'bg-purple-500 hover:bg-purple-600 ring-4 ring-purple-200' 
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
              ? 'text-purple-600' 
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
          <h3 className="text-base sm:text-lg font-semibold text-purple-600 mb-1">
            Tiến độ thiết kế
          </h3>
          <p className="text-sm text-gray-600">
            Theo dõi quá trình thiết kế từ đầu đến hoàn thành
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
            
            {order?.estimatedCompletionDate && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium text-gray-700">Ngày hoàn thành dự kiến:</span>
                <span className="text-sm text-gray-600">
                  {new Date(order.estimatedCompletionDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
            
            {order?.designPrice && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-sm font-medium text-gray-700">Giá thiết kế:</span>
                <span className="text-sm text-gray-600">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(order.designPrice)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignProgressBar;
