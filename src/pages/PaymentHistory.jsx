import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAuthUser,
  selectAuthStatus,
  selectAuthError,
} from '../store/features/auth/authSlice';
import {
  getUserPaymentsThunk,
  selectUserPayments,
  selectUserPaymentsPagination,
  selectUserPaymentsLoading,
  selectPaymentError,
} from '../store/features/payment/paymentSlice';
import {
  CircularProgress,
} from '@mui/material';
import {
  PaymentOutlined,
  ReceiptOutlined,
  ErrorOutline,
  CheckCircleOutline,
  AccessTime,
  TrendingUp,
  AccountBalanceWallet,
  CreditCard,
} from '@mui/icons-material';

const PaymentHistory = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectAuthUser);
  const authLoading = useSelector(selectAuthStatus) === 'loading';
  const authError = useSelector(selectAuthError);
  
  // Payment selectors
  const payments = useSelector(selectUserPayments);
  const pagination = useSelector(selectUserPaymentsPagination);
  const paymentsLoading = useSelector(selectUserPaymentsLoading);
  const paymentError = useSelector(selectPaymentError);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch user payments khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user?.id) {
      dispatch(getUserPaymentsThunk({
        userId: user.id,
        page: currentPage,
        size: pageSize
      }));
    }
  }, [dispatch, user?.id, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'SUCCESS':
        return {
          color: 'success',
          icon: <CheckCircleOutline fontSize="small" />,
          label: 'Thành công'
        };
      case 'FAILED':
        return {
          color: 'error',
          icon: <ErrorOutline fontSize="small" />,
          label: 'Thất bại'
        };
      case 'PENDING':
        return {
          color: 'warning',
          icon: <AccessTime fontSize="small" />,
          label: 'Đang xử lý'
        };
      default:
        return {
          color: 'default',
          icon: <AccessTime fontSize="small" />,
          label: status
        };
    }
  };

  // Get payment type label
  const getPaymentTypeLabel = (type) => {
    const typeMap = {
      'DEPOSIT_CONSTRUCTION': 'Cọc thi công',
      'DEPOSIT_DESIGN': 'Cọc thiết kế',
      'REMAINING_CONSTRUCTION': 'Thanh toán thi công',
      'REMAINING_DESIGN': 'Thanh toán thiết kế'
    };
    return typeMap[type] || type;
  };

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const methodMap = {
      'VN_PAY': 'VNPay',
      'PAYOS': 'PayOS',
      'BANK_TRANSFER': 'Chuyển khoản ngân hàng'
    };
    return methodMap[method] || method;
  };

  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="flex justify-center items-center min-h-96">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Lỗi xác thực: {authError}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Vui lòng đăng nhập để xem lịch sử thanh toán
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-4 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 md:p-8 text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white bg-opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-2">
              <AccountBalanceWallet className="text-3xl md:text-4xl" />
              <h1 className="text-2xl md:text-4xl font-bold text-center sm:text-left">
                Lịch sử thanh toán
              </h1>
            </div>
            <p className="text-base md:text-xl font-light opacity-90 text-center sm:text-left">
              Quản lý và theo dõi tất cả các giao dịch thanh toán của bạn
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {paymentError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {paymentError}
          </div>
        )}

        {/* Loading */}
        {paymentsLoading ? (
          <div className="flex justify-center py-20">
            <CircularProgress size={40} />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {/* Total Transactions Card */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white min-h-32 flex items-center relative overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <TrendingUp className="text-3xl sm:text-4xl opacity-90" />
                    <div className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold mb-1">
                        {pagination.totalElements || 0}
                      </div>
                      <div className="text-base opacity-90">
                        Tổng giao dịch
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Transactions Card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white min-h-32 flex items-center relative overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <CheckCircleOutline className="text-3xl sm:text-4xl opacity-90" />
                    <div className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold mb-1">
                        {payments.filter(p => p.status === 'SUCCESS').length || 0}
                      </div>
                      <div className="text-base opacity-90">
                        Thành công
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Failed Transactions Card */}
              <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white min-h-32 flex items-center relative overflow-hidden rounded-xl">
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white bg-opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="relative z-10 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <ErrorOutline className="text-3xl sm:text-4xl opacity-90" />
                    <div className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold mb-1">
                        {payments.filter(p => p.status === 'FAILED').length || 0}
                      </div>
                      <div className="text-base opacity-90">
                        Thất bại
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Data Display */}
            {payments.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 md:p-6 text-white">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-2xl" />
                    <h2 className="text-lg md:text-xl font-semibold">
                      Chi tiết giao dịch
                    </h2>
                  </div>
                </div>
                
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Mã giao dịch</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Đơn hàng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Số tiền</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Loại thanh toán</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Phương thức</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Trạng thái</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Ngày tạo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => {
                        const statusInfo = getStatusInfo(payment.status);
                        return (
                          <tr key={payment.id} className="even:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  statusInfo.color === 'success' ? 'bg-green-500' : 
                                  statusInfo.color === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                                <span className="text-sm font-semibold text-indigo-600">
                                  #{payment.code}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {payment.orders ? (
                                <div>
                                  <div className="text-sm font-semibold mb-1">
                                    {payment.orders.orderCode}
                                  </div>
                                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded max-w-48 truncate">
                                    {payment.orders.name}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">N/A</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(payment.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-indigo-500 text-indigo-600">
                                {getPaymentTypeLabel(payment.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium">
                                {getPaymentMethodLabel(payment.method)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                                statusInfo.color === 'success' ? 'bg-green-100 text-green-800' :
                                statusInfo.color === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-600">
                                {formatDate(payment.createdAt)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="block md:hidden p-4">
                  {payments.map((payment) => {
                    const statusInfo = getStatusInfo(payment.status);
                    return (
                      <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 last:mb-0">
                        {/* Header Row */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              statusInfo.color === 'success' ? 'bg-green-500' : 
                              statusInfo.color === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-semibold text-indigo-600">
                              #{payment.code}
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusInfo.color === 'success' ? 'bg-green-100 text-green-800' :
                            statusInfo.color === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Order Info */}
                        {payment.orders ? (
                          <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-1">Đơn hàng</div>
                            <div className="text-sm font-semibold mb-1">
                              {payment.orders.orderCode}
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate">
                              {payment.orders.name}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            <div className="text-xs text-gray-500 mb-1">Đơn hàng</div>
                            <div className="text-sm text-gray-500">N/A</div>
                          </div>
                        )}

                        {/* Amount */}
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-1">Số tiền</div>
                          <div className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                            {formatCurrency(payment.amount)}
                          </div>
                        </div>

                        {/* Payment Type and Method */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Loại thanh toán</div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-indigo-500 text-indigo-600">
                              {getPaymentTypeLabel(payment.type)}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Phương thức</div>
                            <div className="text-sm font-medium">
                              {getPaymentMethodLabel(payment.method)}
                            </div>
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Ngày tạo</div>
                          <div className="text-sm font-medium text-gray-600">
                            {formatDate(payment.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.totalElements > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                    <div className="p-4 md:p-6">
                      {/* Pagination Info */}
                      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="text-xs md:text-sm">
                            Hiển thị {((pagination.currentPage - 1) * pagination.pageSize + 1)} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalElements)} trong tổng số {pagination.totalElements} giao dịch
                          </span>
                        </div>
                        <div className="bg-white px-3 md:px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600">
                          Trang {pagination.currentPage} / {Math.max(pagination.totalPages, 1)}
                        </div>
                      </div>
                      
                      {/* Pagination Buttons - Simple version for Tailwind */}
                      <div className="flex justify-center">
                        <div className="flex gap-1 md:gap-2">
                          <button
                            onClick={() => handlePageChange(null, 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Đầu
                          </button>
                          <button
                            onClick={() => handlePageChange(null, pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Trước
                          </button>
                          
                          {/* Page Numbers */}
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                            if (pageNum > pagination.totalPages) return null;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(null, pageNum)}
                                className={`px-3 py-2 text-sm font-semibold rounded-lg ${
                                  pageNum === pagination.currentPage 
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => handlePageChange(null, pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Sau
                          </button>
                          <button
                            onClick={() => handlePageChange(null, pagination.totalPages)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Cuối
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Empty State
              <div className="bg-gradient-to-br from-slate-50 to-slate-200 rounded-xl p-8 md:p-16 text-center relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 opacity-5">
                  <svg width="60" height="60" viewBox="0 0 60 60" className="w-full h-full">
                    <defs>
                      <pattern id="circles" patternUnits="userSpaceOnUse" width="60" height="60">
                        <circle cx="30" cy="30" r="4" fill="currentColor"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circles)" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <ReceiptOutlined className="text-2xl md:text-4xl text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Chưa có giao dịch nào
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 max-w-xs md:max-w-md mx-auto leading-relaxed">
                    Lịch sử thanh toán của bạn sẽ hiển thị ở đây khi bạn thực hiện giao dịch đầu tiên. 
                    Bắt đầu tạo đơn hàng để xem các giao dịch!
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
