# Test Custom Design Flow

## Flow cần test:

### 1. CustomDesign.jsx
1. Vào trang Custom Design
2. Chọn loại biển hiệu và thuộc tính
3. Nhập yêu cầu thiết kế
4. Chọn "Có thi công" hoặc "Không thi công"
5. Click "Xác nhận"

### 2. API Call
- **Endpoint**: `POST /api/customer-details/{customerDetailId}/custom-design-requests`
- **Body**:
  ```json
  {
    "requirements": "Yêu cầu thiết kế từ user",
    "customerChoiceId": "uuid của customer choice",
    "hasOrder": true/false
  }
  ```

### 3. Navigate to Order.jsx
- **State truyền qua**:
  ```javascript
  {
    fromCustomDesign: true,
    customerChoiceId: "uuid",
    customDesignRequestId: "uuid từ response",
    hasConstruction: true/false,
    requirements: "yêu cầu thiết kế",
    selectedType: {object},
    customerDetail: {object}
  }
  ```

### 4. Order.jsx Step 1
- **Title**: "Đặt Hàng Thiết Kế Tùy Chỉnh"
- **Order Type**: Hiển thị tự động
  - `CUSTOM_DESIGN_WITH_CONSTRUCTION` nếu hasConstruction = true
  - `CUSTOM_DESIGN_WITHOUT_CONSTRUCTION` nếu hasConstruction = false
- **User chỉ nhập**: Địa chỉ giao hàng
- **Validation**: Không yêu cầu chọn orderType

### 5. Order.jsx Step 2
- **API Call**: `POST /api/orders/{orderId}/details`
- **Body**:
  ```json
  {
    "customDesignRequestId": "uuid",
    "customerChoiceId": "uuid",
    "quantity": 1
  }
  ```
- **Hiển thị**: Thông tin custom design request

### 6. Order.jsx Step 3
- **API Call**: `GET /api/orders/{orderId}/details`
- **Hiển thị**: Thông tin đơn hàng hoàn tất

## Debug Points:

### Console Logs cần kiểm tra:
1. `Creating custom design request with:` - Trong customeDesignService.js
2. `Custom design request response:` - Response từ API
3. `Order - Debug Custom Design:` - Trong Order.jsx
4. `Order - Debug order ID for Custom Design:` - Khi tạo order detail

### Expected Behavior:
1. CustomDesign.jsx tạo custom design request thành công
2. Navigate đến Order.jsx với đầy đủ thông tin
3. Order.jsx hiển thị đúng title và orderType
4. User chỉ cần nhập địa chỉ
5. Step 2 tạo order detail thành công
6. Step 3 hiển thị thông tin hoàn tất

## Error Cases:
1. **API Error 500**: Kiểm tra endpoint và body format
2. **Missing data**: Kiểm tra validation
3. **Navigation error**: Kiểm tra state truyền qua
4. **OrderType error**: Kiểm tra logic set orderType

## Test Cases:

### Case 1: Có thi công
- hasConstruction = true
- Expected orderType = "CUSTOM_DESIGN_WITH_CONSTRUCTION"

### Case 2: Không thi công  
- hasConstruction = false
- Expected orderType = "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"

### Case 3: Reload page
- Kiểm tra localStorage persistence
- Kiểm tra khôi phục state từ localStorage 