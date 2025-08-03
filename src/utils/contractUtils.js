/**
 * Helper functions for contract operations
 */

/**
 * Tạo FormData cho việc upload hợp đồng đầu tiên
 * @param {Object} data - Dữ liệu hợp đồng
 * @param {number} data.depositPercentChanged - Phần trăm đặt cọc thay đổi
 * @param {string} data.contractNumber - Số hợp đồng
 * @param {File} data.contactFile - File hợp đồng
 * @returns {FormData}
 */
export const createInitialContractFormData = (data) => {
    const formData = new FormData();

    if (data.depositPercentChanged !== undefined) {
        formData.append('depositPercentChanged', data.depositPercentChanged);
    }

    if (data.contractNumber) {
        formData.append('contractNumber', data.contractNumber);
    }

    if (data.contactFile) {
        formData.append('contactFile', data.contactFile);
    }

    return formData;
};

/**
 * Tạo FormData cho việc upload hợp đồng chỉnh sửa
 * @param {Object} data - Dữ liệu hợp đồng chỉnh sửa
 * @param {number} data.depositPercentChanged - Phần trăm đặt cọc thay đổi
 * @param {File} data.contactFile - File hợp đồng chỉnh sửa
 * @returns {FormData}
 */
export const createRevisedContractFormData = (data) => {
    const formData = new FormData();

    if (data.depositPercentChanged !== undefined) {
        formData.append('depositPercentChanged', data.depositPercentChanged);
    }

    if (data.contactFile) {
        formData.append('contactFile', data.contactFile);
    }

    return formData;
};

/**
 * Tạo FormData cho việc upload hợp đồng đã ký
 * @param {File} signedContractFile - File hợp đồng đã ký
 * @returns {FormData}
 */
export const createSignedContractFormData = (signedContractFile) => {
    const formData = new FormData();
    formData.append('signedContractFile', signedContractFile);
    return formData;
};

/**
 * Validate contract data before upload
 * @param {Object} data - Dữ liệu hợp đồng
 * @param {string} type - Loại hợp đồng ('initial', 'revised', 'signed')
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateContractData = (data, type) => {
    const errors = [];

    switch (type) {
        case 'initial':
            if (!data.contactFile) {
                errors.push('File hợp đồng là bắt buộc');
            }
            if (data.depositPercentChanged !== undefined &&
                (data.depositPercentChanged < 0 || data.depositPercentChanged > 100)) {
                errors.push('Phần trăm đặt cọc phải từ 0 đến 100');
            }
            break;

        case 'revised':
            if (!data.contactFile) {
                errors.push('File hợp đồng chỉnh sửa là bắt buộc');
            }
            if (data.depositPercentChanged !== undefined &&
                (data.depositPercentChanged < 0 || data.depositPercentChanged > 100)) {
                errors.push('Phần trăm đặt cọc phải từ 0 đến 100');
            }
            break;

        case 'signed':
            if (!data.signedContractFile) {
                errors.push('File hợp đồng đã ký là bắt buộc');
            }
            break;

        default:
            errors.push('Loại hợp đồng không hợp lệ');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Format contract status for display
 * @param {string} status - Trạng thái hợp đồng
 * @returns {Object} - { label: string, color: string }
 */
export const formatContractStatus = (status) => {
    const statusMap = {
        SENT: { label: 'Đã gửi', color: 'info' },
        SIGNED: { label: 'Đã ký', color: 'success' },
        REJECTED: { label: 'Từ chối', color: 'error' },
        PENDING_REVIEW: { label: 'Chờ xem xét', color: 'warning' },
        DISCUSSING: { label: 'Đang thảo luận', color: 'warning' },
        NEED_RESIGNED: { label: 'Yêu cầu ký lại', color: 'warning' },
        CONFIRMED: { label: 'Đã xác nhận', color: 'success' }
    };

    return statusMap[status] || { label: 'Không xác định', color: 'default' };
};

/**
 * Format date for display
 * @param {string} dateString - Chuỗi ngày tháng
 * @returns {string} - Ngày tháng đã format
 */
export const formatContractDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}; 