# Custom Design Flow Implementation

## Tổng quan

Flow Custom Design đã được implement tương tự như AI Design flow, với 3 bước chính:

### Flow cũ (trước khi implement):
```
CustomDesign.jsx → Tạo Custom Design Request → Tạo Order trực tiếp → Redirect về home
```

### Flow mới (sau khi implement):
```
CustomDesign.jsx → Order.jsx (Step 1) → Step 2 → Step 3
```

## Các thay đổi chính

### 1. CustomDesign.jsx
- **Thay đổi**: Thay vì tạo order trực tiếp, navigate đến Order.jsx
- **State truyền qua**:
  ```javascript
  navigate("/order", {
    state: {
      fromCustomDesign: true,
      customerChoiceId: currentOrder.id,
      customDesignRequestId: result.id,
      hasConstruction: hasOrder,
      requirements: note,
      selectedType: selectedType,
      customerDetail: customerDetail
    }
  });
  ```

### 2. Order.jsx
- **Thêm logic xử lý Custom Design**:
  - `isFromCustomDesign`: Kiểm tra có phải từ Custom Design không
  - `customDesignRequestId`: ID của custom design request
  - `hasConstruction`: Có thi công hay không
  - `requirements`: Yêu cầu thiết kế
  - `selectedType`: Loại biển hiệu
  - `customerDetail`: Thông tin khách hàng

- **Set orderType tự động**:
  ```javascript
  const orderType = hasConstruction 
    ? "CUSTOM_DESIGN_WITH_CONSTRUCTION" 
    : "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION";
  ```

- **LocalStorage management**:
  - Lưu `orderCustomDesignInfo` vào localStorage
  - Khôi phục thông tin khi reload trang

### 3. API Calls

#### Step 1: Tạo Order
```javascript
POST /api/orders
{
  "address": "địa chỉ giao hàng",
  "orderType": "CUSTOM_DESIGN_WITH_CONSTRUCTION" | "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION"
}
```

#### Step 2: Tạo Order Detail
```javascript
POST /api/orders/{orderId}/details
{
  "customDesignRequestId": "uuid",
  "customerChoiceId": "uuid", 
  "quantity": 1
}
```

#### Step 3: Lấy Order Details
```javascript
GET /api/orders/{orderId}/details
```

## UI Changes

### Step 1
- Title: "Đặt Hàng Thiết Kế Tùy Chỉnh"
- Order Type: Hiển thị tự động dựa trên `hasConstruction`
- Ẩn dropdown chọn loại đơn hàng

### Step 2  
- Hiển thị thông tin Custom Design:
  - Yêu cầu thiết kế
  - Loại biển hiệu
  - Thông tin khách hàng
  - Thông tin thiết kế (có/không thi công)

### Step 3
- Hiển thị thông tin đơn hàng hoàn tất
- Bao gồm custom design request details

## Lợi ích

1. **Consistent UX**: User có trải nghiệm giống nhau cho cả AI Design và Custom Design
2. **Better flow control**: Có thể quay lại chỉnh sửa ở step 1
3. **Reusable code**: Tái sử dụng logic của Order.jsx
4. **Clear separation**: Custom Design Request được tạo trước, Order được tạo sau

## Testing

Để test flow mới:

1. Vào trang Custom Design
2. Chọn loại biển hiệu và thuộc tính
3. Nhập yêu cầu thiết kế
4. Chọn có/không thi công
5. Click "Xác nhận"
6. Kiểm tra chuyển đến Order.jsx với thông tin đúng
7. Kiểm tra các step hoạt động bình thường

## Debug

Console logs đã được thêm để debug:
- `Order - Debug Custom Design`: Hiển thị tất cả thông tin custom design
- `Order - Debug order ID for Custom Design`: Debug order ID
- `Order - Debug order ID`: Debug order ID chung 