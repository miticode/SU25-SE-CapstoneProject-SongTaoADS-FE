# Test Flow: Ẩn/Hiện Nút Theo Loại Đơn Hàng

## Flow 1: Tạo Đơn Hàng AI Design Mới
1. Vào `/ai-design?step=billboard`
2. Chọn loại biển hiệu
3. Chọn attributes và values
4. Bấm "Đề xuất thiết kế bằng AI"
5. Hoàn tất thiết kế AI
6. Chuyển đến `/order` và tạo đơn hàng
7. Ở step 3, bấm "TẠO ĐƠN HÀNG MỚI"
8. **Kết quả mong đợi**: 
   - Quay lại `/ai-design?step=billboard`
   - Hiển thị thông báo: "Đang tạo thêm chi tiết cho đơn hàng thiết kế AI. Chỉ có thể tạo thêm thiết kế AI."
   - **Ẩn nút "Thiết kế thủ công"**
   - **Hiển thị nút "Đề xuất thiết kế bằng AI"**

## Flow 2: Tạo Đơn Hàng Custom Design Mới
1. Vào `/ai-design?step=billboard`
2. Chọn loại biển hiệu
3. Chọn attributes và values
4. Bấm "Thiết kế thủ công"
5. Nhập requirements và chọn có/không thi công
6. Chuyển đến `/order` và tạo đơn hàng
7. Ở step 3, bấm "TẠO ĐƠN HÀNG MỚI"
8. **Kết quả mong đợi**:
   - Quay lại `/ai-design?step=billboard`
   - Hiển thị thông báo: "Đang tạo thêm chi tiết cho đơn hàng thiết kế thủ công. Chỉ có thể tạo thêm thiết kế thủ công."
   - **Hiển thị nút "Thiết kế thủ công"**
   - **Ẩn nút "Đề xuất thiết kế bằng AI"**

## Flow 3: Tạo Đơn Hàng Mới (Không Từ Order Cũ)
1. Vào `/ai-design?step=billboard` trực tiếp
2. **Kết quả mong đợi**:
   - Không có thông báo đặc biệt
   - **Hiển thị cả 2 nút**: "Thiết kế thủ công" và "Đề xuất thiết kế bằng AI"

## Kiểm Tra Logic

### Trong BillboardInfoForm.jsx:
```javascript
// Đọc orderType từ localStorage
const orderTypeFromStorage = localStorage.getItem('orderTypeForNewOrder');
const isFromAIDesignOrder = orderTypeFromStorage === 'AI_DESIGN';
const isFromCustomDesignOrder = orderTypeFromStorage === 'CUSTOM_DESIGN_WITH_CONSTRUCTION' || orderTypeFromStorage === 'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION';

// Logic ẩn/hiện nút
const shouldShowCustomDesignButton = !isFromAIDesignOrder;
const shouldShowAIDesignButton = !isFromCustomDesignOrder;
```

### Trong Order.jsx (Nút "TẠO ĐƠN HÀNG MỚI"):
```javascript
// Lưu order ID và order Type vào localStorage
if (currentOrder?.id) {
  localStorage.setItem('orderIdForNewOrder', currentOrder.id.toString());
  localStorage.setItem('orderTypeForNewOrder', currentOrder.orderType || formData.orderType || '');
}
```

## Các Trường Hợp Cần Test:

1. **AI Design Order**: `orderTypeForNewOrder = 'AI_DESIGN'`
   - ✅ Ẩn nút "Thiết kế thủ công"
   - ✅ Hiển thị nút "Đề xuất thiết kế bằng AI"
   - ✅ Hiển thị thông báo phù hợp

2. **Custom Design Order (có thi công)**: `orderTypeForNewOrder = 'CUSTOM_DESIGN_WITH_CONSTRUCTION'`
   - ✅ Hiển thị nút "Thiết kế thủ công"
   - ✅ Ẩn nút "Đề xuất thiết kế bằng AI"
   - ✅ Hiển thị thông báo phù hợp

3. **Custom Design Order (không thi công)**: `orderTypeForNewOrder = 'CUSTOM_DESIGN_WITHOUT_CONSTRUCTION'`
   - ✅ Hiển thị nút "Thiết kế thủ công"
   - ✅ Ẩn nút "Đề xuất thiết kế bằng AI"
   - ✅ Hiển thị thông báo phù hợp

4. **Tạo mới (không có orderType)**: `orderTypeForNewOrder = null/undefined`
   - ✅ Hiển thị cả 2 nút
   - ✅ Không hiển thị thông báo đặc biệt
