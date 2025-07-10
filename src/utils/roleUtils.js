// Định nghĩa các role constants
export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER', 
  DESIGNER: 'DESIGNER',
  SALE: 'SALE',
  STAFF: 'STAFF', // MANAGER
};

// Helper function để kiểm tra role của user
export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.name === role;
};

// Helper function để kiểm tra multiple roles
export const hasAnyRole = (user, roles = []) => {
  if (!user || !user.roles) return false;
  return roles.includes(user.roles.name);
};

// Helper function để lấy role name
export const getUserRole = (user) => {
  if (!user || !user.roles) return null;
  return user.roles.name;
};

// Helper function để kiểm tra quyền admin
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);

// Helper function để kiểm tra quyền customer
export const isCustomer = (user) => hasRole(user, ROLES.CUSTOMER);

// Helper function để kiểm tra quyền designer
export const isDesigner = (user) => hasRole(user, ROLES.DESIGNER);

// Helper function để kiểm tra quyền sale
export const isSale = (user) => hasRole(user, ROLES.SALE);

// Helper function để kiểm tra quyền staff (manager)
export const isStaff = (user) => hasRole(user, ROLES.STAFF);

// Helper function để lấy default redirect path dựa trên role
export const getDefaultRedirectPath = (userRole) => {
  switch (userRole) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.DESIGNER:
      return '/designer';
    case ROLES.SALE:
      return '/sale';
    case ROLES.STAFF:
      return '/manager';
    case ROLES.CUSTOMER:
      return '/'; 
    default:
      return '/';
  }
};

// Helper function để kiểm tra quyền truy cập route
export const canAccessRoute = (user, requiredRoles = []) => {
  if (!user || !user.roles) return false;
  if (requiredRoles.length === 0) return true; // Không yêu cầu role cụ thể
  return requiredRoles.includes(user.roles.name);
};

// Helper function để lấy tên hiển thị của role
export const getRoleDisplayName = (roleName) => {
  switch (roleName) {
    case ROLES.ADMIN:
      return 'Quản trị viên';
    case ROLES.CUSTOMER:
      return 'Khách hàng';
    case ROLES.DESIGNER:
      return 'Thiết kế viên';
    case ROLES.SALE:
      return 'Nhân viên bán hàng';
    case ROLES.STAFF:
      return 'Quản lý';
    default:
      return 'Người dùng';
  }
};