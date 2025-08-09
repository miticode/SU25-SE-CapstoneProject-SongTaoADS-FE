# Hướng dẫn tích hợp Search cho DashboardContent Component

## Vấn đề
Hiện tại search chỉ hoạt động trong trang hiện tại vì:
- **Server-side pagination**: Server chỉ trả về 10 items cho mỗi trang
- **Client-side search**: Search chỉ filter trong 10 items đó
- **Kết quả**: Không thể tìm thấy items ở trang khác

## Giải pháp

### Option 1: Server-side Search (Khuyến nghị)

Thêm `onSearchChange` callback vào DashboardContent:

```jsx
<DashboardContent
  stats={stats}
  orders={orders}
  statusFilter={statusFilter}
  onStatusFilterChange={handleStatusFilterChange}
  onRefreshOrders={handleRefreshOrders}
  pagination={pagination}
  onPageChange={handlePageChange}
  onRowsPerPageChange={handleRowsPerPageChange}
  onSearchChange={handleSearchChange} // ← Thêm callback này
/>
```

Trong parent component:
```jsx
const handleSearchChange = useCallback((searchTerm) => {
  // Reset về trang 1 khi search
  setCurrentPage(1);
  
  // Gọi API với search term
  dispatch(fetchOrders({
    page: 1,
    size: pageSize,
    search: searchTerm, // ← Gửi search term lên server
    status: statusFilter
  }));
}, [dispatch, pageSize, statusFilter]);
```

**Ưu điểm:**
- ✅ Search toàn bộ database
- ✅ Performance tốt với dataset lớn  
- ✅ Trải nghiệm người dùng tốt

### Option 2: Client-side Search (Hiện tại)

Nếu không thêm `onSearchChange`, component sẽ hiển thị warning:
- ⚠️ "Chỉ tìm kiếm trong trang hiện tại"

**Ưu điểm:**
- ✅ Không cần thay đổi API
- ❌ Chỉ search trong trang hiện tại
- ❌ Trải nghiệm người dùng kém

## API Backend Update Needed

Để hỗ trợ server-side search, backend cần accept thêm search parameter:

```javascript
// API endpoint example
GET /api/orders?page=1&size=10&search=DH-SOC4IGR2DF&status=PENDING_CONTRACT

// Search fields:
// - orderCode
// - users.fullName  
// - users.email
// - users.phone
// - users.address
```

## Implementation Status

- ✅ Frontend component updated
- ⏳ Parent component integration needed
- ⏳ Backend API search support needed

## Testing

1. **Với onSearchChange**: Search sẽ tìm kiếm toàn database
2. **Không có onSearchChange**: Hiển thị warning và chỉ search trang hiện tại
