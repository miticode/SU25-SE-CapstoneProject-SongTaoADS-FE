/**
 * Cookie Manager đơn giản hóa khi backend xử lý token qua HTTP-only cookies
 */

// Kiểm tra xem người dùng đã đăng nhập chưa dựa trên state
let authState = {
  isAuthenticated: false,
  user: null
};

// Cập nhật trạng thái đăng nhập
export const setAuthState = (state) => {
  authState = { ...authState, ...state };
};

// Lấy trạng thái đăng nhập hiện tại
export const isAuthenticated = () => {
  return authState.isAuthenticated;
};

// Lấy thông tin người dùng
export const getUser = () => {
  return authState.user;
};

// Reset trạng thái khi đăng xuất
export const clearAuth = () => {
  authState.isAuthenticated = false;
  authState.user = null;
};