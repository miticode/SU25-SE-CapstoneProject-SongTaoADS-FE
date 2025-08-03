# Contract API Documentation

## Tổng quan
Module này cung cấp các API để quản lý hợp đồng trong hệ thống. Bao gồm việc tạo, xem, chỉnh sửa và xác nhận hợp đồng.

## API Endpoints

### 1. Xem hợp đồng theo đơn hàng
- **Method**: `GET`
- **URL**: `/api/orders/{orderId}/contract`
- **Description**: Lấy thông tin hợp đồng của một đơn hàng
- **Function**: `getOrderContractApi(orderId)`

### 2. Sale tạo bản hợp đồng đầu tiên
- **Method**: `POST`
- **URL**: `/api/orders/{orderId}/contract`
- **Description**: Sale tạo và upload bản hợp đồng đầu tiên cho đơn hàng
- **Function**: `uploadOrderContractApi(orderId, formData)`
- **FormData fields**:
  - `depositPercentChanged` (optional): Phần trăm đặt cọc thay đổi
  - `contractNumber` (optional): Số hợp đồng
  - `contactFile` (required): File hợp đồng

### 3. Khách hàng gửi hợp đồng đã ký
- **Method**: `PATCH`
- **URL**: `/api/contracts/{contractId}/signed-contract`
- **Description**: Khách hàng upload bản hợp đồng đã ký
- **Function**: `uploadSignedContractApi(contractId, signedContractFile)`
- **FormData fields**:
  - `signedContractFile` (required): File hợp đồng đã ký

### 4. Sale gửi lại bản hợp đồng đã chỉnh sửa
- **Method**: `PATCH`
- **URL**: `/api/contracts/{contractId}/revised-contract`
- **Description**: Sale upload bản hợp đồng đã chỉnh sửa
- **Function**: `uploadRevisedContractApi(contractId, formData)`
- **FormData fields**:
  - `depositPercentChanged` (optional): Phần trăm đặt cọc thay đổi
  - `contactFile` (required): File hợp đồng chỉnh sửa

### 5. Khách hàng yêu cầu thảo luận thêm về hợp đồng
- **Method**: `PATCH`
- **URL**: `/api/contracts/{contractId}/discuss`
- **Description**: Khách hàng yêu cầu thảo luận thêm về hợp đồng
- **Function**: `discussContractApi(contractId)`

### 6. Sale xác nhận đơn hàng đã ký
- **Method**: `PATCH`
- **URL**: `/api/orders/{orderId}/contract-signed`
- **Description**: Sale xác nhận đơn hàng đã được ký hợp đồng
- **Function**: `confirmContractSignedApi(orderId)`

### 7. Sale yêu cầu khách hàng gửi lại bản hợp đồng đã ký
- **Method**: `PATCH`
- **URL**: `/api/orders/{orderId}/contract-resign`
- **Description**: Sale yêu cầu khách hàng gửi lại bản hợp đồng đã ký
- **Function**: `requestContractResignApi(orderId)`

## Contract Status

Các trạng thái hợp đồng có thể có:

- `SENT`: Đã gửi
- `SIGNED`: Đã ký
- `REJECTED`: Từ chối
- `PENDING_REVIEW`: Chờ xem xét
- `DISCUSSING`: Đang thảo luận
- `NEED_RESIGNED`: Yêu cầu ký lại
- `CONFIRMED`: Đã xác nhận

## Redux Actions

### Async Thunks

1. **uploadContract**: Upload hợp đồng đầu tiên
2. **getOrderContract**: Lấy thông tin hợp đồng
3. **discussContract**: Yêu cầu thảo luận hợp đồng
4. **uploadRevisedContract**: Upload hợp đồng chỉnh sửa
5. **uploadSignedContract**: Upload hợp đồng đã ký
6. **confirmContractSigned**: Xác nhận đơn hàng đã ký
7. **requestContractResign**: Yêu cầu gửi lại hợp đồng

### Selectors

- `selectContracts`: Lấy danh sách hợp đồng
- `selectCurrentContract`: Lấy hợp đồng hiện tại
- `selectContractLoading`: Trạng thái loading
- `selectContractError`: Lỗi
- `selectContractSuccess`: Trạng thái thành công

## Helper Functions

### FormData Creation

1. **createInitialContractFormData(data)**: Tạo FormData cho hợp đồng đầu tiên
2. **createRevisedContractFormData(data)**: Tạo FormData cho hợp đồng chỉnh sửa
3. **createSignedContractFormData(signedContractFile)**: Tạo FormData cho hợp đồng đã ký

### Validation

- **validateContractData(data, type)**: Validate dữ liệu hợp đồng

### Formatting

- **formatContractStatus(status)**: Format trạng thái hợp đồng
- **formatContractDate(dateString)**: Format ngày tháng

## Usage Examples

### Upload hợp đồng đầu tiên
```javascript
import { uploadContract } from '../store/features/contract/contractSlice';
import { createInitialContractFormData } from '../utils/contractUtils';

const contractData = {
  depositPercentChanged: 30,
  contractNumber: 'CTR-001',
  contactFile: file
};

const formData = createInitialContractFormData(contractData);
dispatch(uploadContract({ orderId: 'order123', formData }));
```

### Upload hợp đồng đã ký
```javascript
import { uploadSignedContract } from '../store/features/contract/contractSlice';

dispatch(uploadSignedContract({ 
  contractId: 'contract123', 
  signedContractFile: file 
}));
```

### Xác nhận đơn hàng đã ký
```javascript
import { confirmContractSigned } from '../store/features/contract/contractSlice';

dispatch(confirmContractSigned('order123'));
```

## Error Handling

Tất cả các API đều trả về response với format:
```javascript
{
  success: boolean,
  data?: any,
  error?: string
}
```

Khi có lỗi, `success` sẽ là `false` và `error` sẽ chứa thông báo lỗi.

## Notes

- Tất cả các API đều sử dụng Bearer token authentication
- File upload sử dụng `multipart/form-data`
- Các API trả về thông tin order sẽ cập nhật trạng thái đơn hàng
- Các API trả về thông tin contract sẽ cập nhật trạng thái hợp đồng 