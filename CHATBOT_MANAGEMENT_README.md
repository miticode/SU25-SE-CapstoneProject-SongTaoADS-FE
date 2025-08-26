# Hệ Thống Quản Lý Chat Bot Topic - SongTao ADS

## Tổng Quan

Hệ thống quản lý Chat Bot Topic được xây dựng để quản lý mối quan hệ giữa Model Chat Bot và Topic, cũng như quản lý các chủ đề và câu hỏi đề xuất cho chatbot.

## Cấu Trúc Hệ Thống

### 1. Chat Bot Topic (Mối quan hệ Model Chat Bot - Topic)
- **Bảng trung gian**: Liên kết giữa Model Chat Bot và Topic
- **Chức năng**: Xác định chatbot nào sẽ xử lý chủ đề nào
- **Quản lý**: Thêm, xóa, xem mối quan hệ

### 2. Topic (Chủ đề)
- **Chức năng**: Lưu trữ các chủ đề mà chatbot có thể xử lý
- **Ví dụ**: "Hỗ trợ kỹ thuật", "Tư vấn sản phẩm", "Báo giá"
- **Quản lý**: CRUD đầy đủ

### 3. Question (Câu hỏi đề xuất)
- **Chức năng**: Lưu trữ các câu hỏi đề xuất cho từng topic
- **Ví dụ**: "Làm thế nào để reset mật khẩu?"
- **Quản lý**: CRUD đầy đủ, liên kết với Topic

## API Endpoints

### Chat Bot Topic
```
POST   /api/model-chat/{modelChatBotId}/topics/{topicId}/chat-bot-topic
GET    /api/model-chat/{modelChatBotId}/chat-bot-topic
POST   /api/model-chat/{modelChatBotId}/chat-bot-topic
GET    /api/topic/{topicId}/chat-bot-topic
GET    /api/chat-bot-topic
GET    /api/chat-bot-topic/{id}
DELETE /api/chat-bot-topic/{id}
```

### Topic
```
GET    /api/topics/{id}
PUT    /api/topics/{id}
DELETE /api/topics/{id}
GET    /api/topics
POST   /api/topics
```

### Question
```
GET    /api/questions/{questionId}
PUT    /api/questions/{questionId}
DELETE /api/questions/{questionId}
POST   /api/topics/{topicId}/questions
GET    /api/topic/{topicId}/question
GET    /api/questions
```

## Giao Diện Quản Lý

### 1. Chat Bot Topic Manager
**Đường dẫn**: Manager Panel → Chat Bot Topic

**Chức năng**:
- Xem danh sách tất cả Chat Bot Topic
- Thêm mới mối quan hệ Model Chat Bot - Topic
- Xóa mối quan hệ
- Xem thống kê tổng quan

**Cách sử dụng**:
1. Chọn "Chat Bot Topic" từ menu bên trái
2. Nhấn "Thêm mới" để tạo mối quan hệ mới
3. Chọn Model Chat Bot và Topic từ dropdown
4. Lưu để tạo mối quan hệ

### 2. Topic & Question Manager
**Đường dẫn**: Manager Panel → Topic & Question

**Chức năng**:
- Quản lý Topic (CRUD)
- Quản lý Question cho từng Topic
- Xem thống kê Topic và Question
- Mở rộng để xem câu hỏi của từng Topic

**Cách sử dụng**:
1. Chọn "Topic & Question" từ menu bên trái
2. Nhấn "Thêm Topic" để tạo chủ đề mới
3. Nhấn icon câu hỏi để xem câu hỏi của Topic
4. Nhấn icon "+" để thêm câu hỏi cho Topic
5. Sử dụng các icon chỉnh sửa/xóa để quản lý

## Luồng Hoạt Động

### 1. Tạo Topic mới
```
1. Vào Topic & Question Manager
2. Nhấn "Thêm Topic"
3. Nhập tiêu đề và mô tả
4. Lưu Topic
```

### 2. Tạo Question cho Topic
```
1. Trong Topic & Question Manager
2. Nhấn icon câu hỏi để mở rộng Topic
3. Nhấn icon "+" để thêm câu hỏi
4. Nhập câu hỏi và trả lời (tùy chọn)
5. Lưu Question
```

### 3. Gán Topic vào Model Chat Bot
```
1. Vào Chat Bot Topic Manager
2. Nhấn "Thêm mới"
3. Chọn Model Chat Bot và Topic
4. Lưu để tạo mối quan hệ
```

## Cấu Trúc Dữ Liệu

### Chat Bot Topic
```json
{
  "id": 1,
  "modelChatBotId": 1,
  "topicId": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Topic
```json
{
  "id": 1,
  "title": "Hỗ trợ kỹ thuật",
  "description": "Các vấn đề kỹ thuật và hướng dẫn sử dụng",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Question
```json
{
  "id": 1,
  "topicId": 1,
  "question": "Làm thế nào để reset mật khẩu?",
  "answer": "Vào trang đăng nhập, nhấn 'Quên mật khẩu'",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## Lưu Ý Kỹ Thuật

### 1. Redux Store
- **chatBotTopic**: Quản lý state cho Chat Bot Topic
- **topic**: Quản lý state cho Topic
- **question**: Quản lý state cho Question

### 2. API Service
- **chatBotTopicService**: Xử lý API cho Chat Bot Topic
- **topicService**: Xử lý API cho Topic
- **questionService**: Xử lý API cho Question

### 3. Components
- **ChatBotTopicManager**: Quản lý Chat Bot Topic
- **TopicManager**: Quản lý Topic và Question
- **ManagerLayout**: Layout chính cho Manager Panel

## Xử Lý Lỗi

### 1. Validation
- Topic title không được để trống
- Question không được để trống
- Model Chat Bot và Topic phải được chọn

### 2. Error Handling
- Hiển thị thông báo lỗi qua Snackbar
- Loading state cho các thao tác async
- Confirm dialog cho các thao tác xóa

### 3. Success Feedback
- Thông báo thành công qua Snackbar
- Tự động refresh dữ liệu sau khi thao tác
- Auto-hide thông báo sau 3 giây

## Tích Hợp Với Advanced Chat

Hệ thống này tích hợp với Advanced Chat để:
1. Hiển thị danh sách Topic cho người dùng
2. Hiển thị câu hỏi đề xuất cho từng Topic
3. Xử lý chat dựa trên Topic được gán cho Model Chat Bot

## Bảo Mật

- Sử dụng JWT token cho authentication
- Role-based access control (chỉ Manager mới có quyền truy cập)
- Validation dữ liệu đầu vào
- Sanitize dữ liệu trước khi lưu vào database

## Hướng Dẫn Triển Khai

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình API
- Cập nhật `API_BASE_URL` trong các service file
- Đảm bảo backend API đã được triển khai

### 3. Chạy ứng dụng
```bash
npm run dev
```

### 4. Truy cập
- Manager Panel: `/manager`
- Chat Bot Topic: Manager Panel → Chat Bot Topic
- Topic & Question: Manager Panel → Topic & Question

## Hỗ Trợ

Nếu gặp vấn đề hoặc cần hỗ trợ:
1. Kiểm tra console log để xem lỗi
2. Kiểm tra network tab để xem API calls
3. Liên hệ team development

---

**Phiên bản**: 1.0.0  
**Cập nhật**: 2024-01-01  
**Tác giả**: SongTao ADS Development Team

