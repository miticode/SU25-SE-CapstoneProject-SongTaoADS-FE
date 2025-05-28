import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const isAdmin = () => {
    return user?.role === 'ADMIN';
  };

  const isSale = () => {
    return user?.role === 'SALE';
  };

  const isUser = () => {
    return user?.role === 'USER';
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSale,
    isUser,
  };
}; 