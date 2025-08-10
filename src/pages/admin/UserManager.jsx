import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  toggleUserStatus,
  createUser,
  banUser,
} from "../../store/features/user/userSlice";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Switch,
  FormControlLabel,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Phone as PhoneIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const UserManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();

  // Users table state
  const [page, setPage] = useState(0); // Material-UI uses 0-based pagination
  const [rowsPerPage, setRowsPerPage] = useState(10); // Match API default pageSize
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create User Dialog State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    isActive: true,
    roleName: 'STAFF'
  });
  const [createUserErrors, setCreateUserErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Ban/Unban Confirm Dialog State
  const [banConfirmDialog, setBanConfirmDialog] = useState({
    open: false,
    userId: null,
    userName: '',
    currentBanStatus: false
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasLetter: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Email validation state
  const [emailValidation, setEmailValidation] = useState({
    isValid: false,
    error: ""
  });

  // Phone validation state
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    error: ""
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Redux state
  const {
    users,
    status: usersStatus,
    error: usersError,
    totalElements,
    pageSize,
  } = useSelector((state) => state.users);

  // Available roles
  const availableRoles = [
    { value: 'ADMIN', label: 'Quản trị viên' },
    { value: 'DESIGNER', label: 'Thiết kế viên' },
    { value: 'SALE', label: 'Nhân viên bán hàng' },
    { value: 'STAFF', label: 'Nhân viên' },
    { value: 'CUSTOMER', label: 'Khách hàng' }
  ];

  // Function to get role label
  const getRoleLabel = (roleName) => {
    const role = availableRoles.find(role => role.value === roleName);
    return role ? role.label : roleName;
  };

  // Load users function
  const loadUsers = () => {
    const params = {
      page: page + 1, // Convert 0-based (UI) to 1-based (API)
      size: rowsPerPage,
      search: searchTerm.trim()
    };
    
    dispatch(fetchUsers(params));
  };

  // Load all users for filtering (without pagination)
  const loadAllUsers = () => {
    const params = {
      page: 1,
      size: 1000, // Large number to get all users
      search: searchTerm.trim()
    };
    
    dispatch(fetchUsers(params));
    setPage(0); // Reset to first page
  };

  // Effects
  useEffect(() => {
    // Load initial data when component mounts
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  useEffect(() => {
    // Only load paginated data when no filters are active and not searching
    if (roleFilter === 'all' && statusFilter === 'all' && !searchTerm.trim()) {
      // Add a small delay to debounce search queries for normal pagination
      const timeoutId = setTimeout(() => {
        const params = {
          page: page + 1, // Convert 0-based (UI) to 1-based (API)
          size: rowsPerPage,
          search: searchTerm.trim()
        };
        
        dispatch(fetchUsers(params));
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter, dispatch]);

  // Create User Dialog Functions
  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setCreateUserForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      isActive: true,
      roleName: 'STAFF'
    });
    setCreateUserErrors({});
    setPasswordValidation({
      length: false,
      hasLetter: false,
      hasNumber: false,
      hasSpecial: false,
    });
    setEmailValidation({
      isValid: false,
      error: ""
    });
    setPhoneValidation({
      isValid: false,
      error: ""
    });
    setShowPassword(false);
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    let error = "";
    
    if (!email) {
      error = "";
    } else if (email.length < 3) {
      error = "Email quá ngắn";
    } else if (!emailRegex.test(email)) {
      error = "Email không hợp lệ";
    } else if (email.length > 254) {
      error = "Email quá dài";
    }
    
    return { isValid, error };
  };

  // Check email validity real-time
  const checkEmailValidity = (email) => {
    const validation = validateEmail(email);
    setEmailValidation(validation);
    return validation;
  };

  // Phone validation function
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    const isValid = phoneRegex.test(phone);
    let error = "";
    
    if (!phone) {
      error = "";
    } else if (phone.length < 10) {
      error = "Số điện thoại quá ngắn";
    } else if (phone.length > 11) {
      error = "Số điện thoại quá dài";
    } else if (!/^[0-9]+$/.test(phone)) {
      error = "Số điện thoại chỉ được chứa số";
    } else if (!phoneRegex.test(phone)) {
      error = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }
    
    return { isValid, error };
  };

  // Check phone validity real-time
  const checkPhoneValidity = (phone) => {
    const validation = validatePhone(phone);
    setPhoneValidation(validation);
    return validation;
  };

  // Password validation function
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/;
    return passwordRegex.test(password);
  };

  // Check password strength real-time
  const checkPasswordStrength = (password) => {
    const validation = {
      length: password.length >= 7,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@$!%*#?&]/.test(password),
    };
    setPasswordValidation(validation);
    return validation;
  };

  const handleCreateUserFormChange = (field, value) => {
    setCreateUserForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Real-time password validation
    if (field === 'password') {
      checkPasswordStrength(value);
    }
    
    // Real-time email validation
    if (field === 'email') {
      checkEmailValidity(value);
    }
    
    // Real-time phone validation
    if (field === 'phone') {
      checkPhoneValidity(value);
    }
    
    // Clear error khi user đã nhập lại
    if (createUserErrors[field]) {
      setCreateUserErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateCreateUserForm = () => {
    const errors = {};
    
    if (!createUserForm.fullName.trim()) {
      errors.fullName = 'Họ tên là bắt buộc';
    }
    
    if (!createUserForm.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else {
      const emailValidationResult = validateEmail(createUserForm.email);
      if (!emailValidationResult.isValid) {
        errors.email = emailValidationResult.error;
      }
    }
    
    if (!createUserForm.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else {
      const phoneValidationResult = validatePhone(createUserForm.phone);
      if (!phoneValidationResult.isValid) {
        errors.phone = phoneValidationResult.error;
      }
    }
    
    if (!createUserForm.password.trim()) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (!validatePassword(createUserForm.password)) {
      errors.password = 'Mật khẩu phải có ít nhất 7 ký tự, bao gồm chữ, số và ký tự đặc biệt (@$!%*#?&)';
    }
    
    if (!createUserForm.roleName) {
      errors.roleName = 'Vai trò là bắt buộc';
    }
    
    setCreateUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateCreateUserForm()) {
      return;
    }

    try {
      await dispatch(createUser(createUserForm)).unwrap();
      setSnackbar({
        open: true,
        message: 'Tạo người dùng thành công!',
        severity: 'success'
      });
      handleCloseCreateDialog();
      loadUsers(); // Refresh users list
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi tạo người dùng',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    setPage(0); // Reset to first page when searching
    
    // Auto-search as user types (debounced via useEffect)
    if (newSearchTerm.trim()) {
      // Load all users for comprehensive search
      setTimeout(() => {
        loadAllUsers();
      }, 300); // 300ms debounce
    } else {
      // If search is cleared, go back to normal pagination
      setTimeout(() => {
        if (roleFilter === 'all' && statusFilter === 'all') {
          loadUsers();
        }
      }, 300);
    }
  };

  const handleRoleFilterChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(0); // Reset to first page when changing filter
    loadAllUsers(); // Load all users when filtering
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // Reset to first page when changing filter
    loadAllUsers(); // Load all users when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing page size
  };

  const handleSearch = () => {
    setPage(0); // Reset to first page
    if (searchTerm.trim()) {
      loadAllUsers(); // Load all users for comprehensive search
    }
  };

  const handleToggleUserStatus = (userId, currentStatus) => {
    dispatch(toggleUserStatus({ userId, isActive: !currentStatus }));
  };

  const handleOpenBanConfirm = (userId, userName, currentBanStatus) => {
    setBanConfirmDialog({
      open: true,
      userId,
      userName,
      currentBanStatus
    });
  };

  const handleCloseBanConfirm = () => {
    setBanConfirmDialog({
      open: false,
      userId: null,
      userName: '',
      currentBanStatus: false
    });
  };

  const handleConfirmBanUser = async () => {
    try {
      await dispatch(banUser({ 
        userId: banConfirmDialog.userId, 
        isBanned: !banConfirmDialog.currentBanStatus 
      })).unwrap();
      setSnackbar({
        open: true,
        message: !banConfirmDialog.currentBanStatus ? 'Người dùng đã bị cấm!' : 'Người dùng đã được bỏ cấm!',
        severity: 'success'
      });
      loadUsers(); // Refresh users list
      handleCloseBanConfirm();
    } catch (error) {
      console.error('Error updating ban status:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái cấm',
        severity: 'error'
      });
      handleCloseBanConfirm();
    }
  };

  // Function to highlight search term in text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <Box 
          key={index}
          component="span"
          sx={{ 
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
            px: 0.5,
            py: 0.2,
            borderRadius: 0.5,
            fontSize: 'inherit',
            fontWeight: 600
          }}
        >
          {part}
        </Box>
      ) : part
    );
  };

  // Use only real API data with filtering and client-side pagination
  const displayUsers = (users || []).filter(user => {
    // Search filter - search in name, email, phone
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const fullName = (user.fullName || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      
      const matchesSearch = fullName.includes(searchLower) || 
                           email.includes(searchLower) || 
                           phone.includes(searchLower);
      
      if (!matchesSearch) {
        return false;
      }
    }
    
    // Role filter
    if (roleFilter !== 'all' && user.roles?.name !== roleFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter === 'active' && !user.isActive) {
      return false;
    }
    if (statusFilter === 'inactive' && user.isActive) {
      return false;
    }
    
    return true;
  });

  // Client-side pagination for filtered results
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = (roleFilter !== 'all' || statusFilter !== 'all' || searchTerm.trim()) 
    ? displayUsers.slice(startIndex, endIndex) 
    : displayUsers;

  // Total count for pagination
  const totalCount = (roleFilter !== 'all' || statusFilter !== 'all' || searchTerm.trim()) 
    ? displayUsers.length 
    : (totalElements || displayUsers.length);

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 },
      maxWidth: '100%',
      overflow: 'hidden'
    }}>
      <Box
        mb={{ xs: 2, sm: 3 }}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant={{ xs: "h6", sm: "h5", md: "h4" }} 
          fontWeight="bold"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
            lineHeight: { xs: 1.2, sm: 1.3 }
          }}
        >
          Quản Lý Người Dùng
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          onClick={handleOpenCreateDialog}
          fullWidth={isMobile}
          sx={{ 
            borderRadius: { xs: 1.5, sm: 2 },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.25 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            '&:hover': {
              boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
            }
          }}
        >
          {isMobile ? "Thêm" : "Thêm Người Dùng"}
        </Button>
      </Box>

      {usersError && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            borderRadius: { xs: 1.5, sm: 2 }
          }}
        >
          {usersError ||
            "Không thể kết nối với API. Hiển thị dữ liệu mẫu thay thế."}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          boxShadow: { 
            xs: "0 2px 8px rgba(0,0,0,0.1)", 
            sm: "0 2px 10px rgba(0,0,0,0.08)" 
          },
          overflow: "hidden",
          bgcolor: 'background.paper'
        }}
      >
        <Box
          p={{ xs: 2.5, sm: 3, md: 4 }}
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Search Bar Section */}
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={{ xs: 2.5, sm: 3 }}
            alignItems={{ xs: "stretch", sm: "flex-end" }}
            mb={{ xs: 2.5, sm: 3 }}
          >
            <Box flexGrow={1}>
              <Typography 
                variant="body2" 
                sx={{ 
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                 Tìm kiếm người dùng
              </Typography>
             
              <TextField
                variant="outlined"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                size={isMobile ? "medium" : "medium"}
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <SearchIcon 
                      sx={{ 
                        mr: 1.5, 
                        fontSize: { xs: 20, sm: 22 },
                        color: searchTerm ? 'primary.main' : 'action.active'
                      }} 
                    />
                  ),
                  endAdornment: searchTerm && (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          display: { xs: 'none', sm: 'block' }
                        }}
                      >
                        {displayUsers.length} kết quả
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleSearch}
                        sx={{ 
                          minWidth: { xs: 60, sm: 80 },
                          px: { xs: 2, sm: 3 },
                          py: { xs: 0.75, sm: 1 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          fontWeight: 600,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                          }
                        }}
                      >
                        {isMobile ? "Tìm" : "Tìm kiếm"}
                      </Button>
                    </Box>
                  ),
                }}
                sx={{ 
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    boxShadow: searchTerm ? '0 4px 16px rgba(102, 126, 234, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    border: searchTerm ? '1.5px solid #667eea' : '1.5px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1.5px solid rgba(102, 126, 234, 0.3)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                      border: '1.5px solid #667eea',
                    }
                  },
                  '& .MuiInputBase-input': {
                    py: { xs: 1.5, sm: 1.75 },
                  }
                }}
              />
            </Box>
          </Box>

          {/* Filters Section */}
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: { xs: '0.8rem', sm: '0.875rem' }
              }}
            >
               Bộ lọc nâng cao
            </Typography>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              gap={{ xs: 2, sm: 2.5 }}
              alignItems={{ xs: "stretch", sm: "flex-start" }}
            >
              <FormControl 
                variant="outlined" 
                size="medium"
                sx={{ 
                  minWidth: { xs: "100%", sm: 160 },
                  flexGrow: { xs: 1, sm: 0 }
                }}
              >
                <InputLabel 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}
                >
                  Vai trò
                </InputLabel>
                <Select
                  label="Vai trò"
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1.5px solid transparent',
                    transition: 'all 0.3s ease',
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 1.75 },
                      fontWeight: 500
                    },
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1.5px solid rgba(102, 126, 234, 0.3)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                      border: '1.5px solid #667eea',
                    }
                  }}
                >
                  <MenuItem value="all" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'grey.400' 
                      }} />
                      Tất cả vai trò
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'error.main' 
                      }} />
                      Quản trị viên
                    </Box>
                  </MenuItem>
                  <MenuItem value="DESIGNER" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'warning.main' 
                      }} />
                      Thiết kế viên
                    </Box>
                  </MenuItem>
                  <MenuItem value="STAFF" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'info.main' 
                      }} />
                      Nhân viên
                    </Box>
                  </MenuItem>
                  <MenuItem value="CUSTOMER" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main' 
                      }} />
                      Khách hàng
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl 
                variant="outlined" 
                size="medium"
                sx={{ 
                  minWidth: { xs: "100%", sm: 160 },
                  flexGrow: { xs: 1, sm: 0 }
                }}
              >
                <InputLabel 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}
                >
                  Trạng thái
                </InputLabel>
                <Select
                  label="Trạng thái"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1.5px solid transparent',
                    transition: 'all 0.3s ease',
                    '& .MuiSelect-select': {
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      py: { xs: 1.5, sm: 1.75 },
                      fontWeight: 500
                    },
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1.5px solid rgba(102, 126, 234, 0.3)',
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
                      border: '1.5px solid #667eea',
                    }
                  }}
                >
                  <MenuItem value="all" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'grey.400' 
                      }} />
                      Tất cả trạng thái
                    </Box>
                  </MenuItem>
                  <MenuItem value="active" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'success.main' 
                      }} />
                      Hoạt động
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        bgcolor: 'error.main' 
                      }} />
                      Không hoạt động
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters Button */}
              {(roleFilter !== 'all' || statusFilter !== 'all' || searchTerm) && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setSearchTerm('');
                    setPage(0);
                    // Load normal paginated data when clearing filters
                    loadUsers();
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 120 },
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.25, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    fontWeight: 600,
                    borderRadius: 2.5,
                    borderColor: 'warning.main',
                    color: 'warning.main',
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    '&:hover': {
                      borderColor: 'warning.dark',
                      bgcolor: 'warning.50',
                      boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)',
                    }
                  }}
                >
                  🗑️ Xóa bộ lọc
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Desktop Table View */}
        {!isMobile && (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Tên</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Số Điện Thoại</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Vai Trò</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Trạng Thái</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Đã Tạo Vào</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Hành Động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usersStatus === "loading" ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Đang tải người dùng...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography variant="body1" color="text.secondary">
                        Không tìm thấy người dùng nào
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={user.avatar}
                              sx={{
                                mr: 2,
                                width: 36,
                                height: 36,
                                bgcolor: `hsl(${user.id.charCodeAt(0) * 10}, 70%, 75%)`,
                              }}
                            >
                              {user.fullName?.charAt(0) || "U"}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {highlightSearchTerm(user.fullName, searchTerm)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {highlightSearchTerm(user.email, searchTerm)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {highlightSearchTerm(user.phone || "Không có", searchTerm)}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Chip
                            label={getRoleLabel(user.roles?.name || 'STAFF')}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(63, 81, 181, 0.1)",
                              color: "#3f51b5",
                              fontSize: '0.75rem',
                              height: 24
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                            size="small"
                            sx={{
                              backgroundColor: user.isActive
                                ? "rgba(76, 175, 80, 0.1)"
                                : "rgba(244, 67, 54, 0.1)",
                              color: user.isActive
                                ? "#4caf50"
                                : "#f44336",
                              cursor: "pointer",
                              fontSize: '0.75rem',
                              height: 24
                            }}
                            onClick={() =>
                              handleToggleUserStatus(user.id, user.isActive)
                            }
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            variant="contained"
                            color={user.isBanned ? "success" : "error"}
                            onClick={() => handleOpenBanConfirm(user.id, user.fullName, user.isBanned)}
                            sx={{ 
                              minWidth: 80,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              borderRadius: 1.5,
                              textTransform: 'none',
                              '&:hover': { 
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Mobile Card View */}
        {isMobile && (
          <Box sx={{ px: 2, pb: 2 }}>
            {usersStatus === "loading" ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={5}>
                <CircularProgress size={40} />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Đang tải người dùng...
                </Typography>
              </Box>
            ) : paginatedUsers.length === 0 ? (
              <Box display="flex" flexDirection="column" alignItems="center" py={5}>
                <Typography variant="body1" color="text.secondary">
                  Không tìm thấy người dùng nào
                </Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                {paginatedUsers.map((user) => (
                    <Paper
                      key={user.id}
                      elevation={1}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" mb={2}>
                        <Avatar
                          src={user.avatar}
                          sx={{
                            mr: 2,
                            width: 48,
                            height: 48,
                            bgcolor: `hsl(${user.id.charCodeAt(0) * 10}, 70%, 75%)`,
                          }}
                        >
                          {user.fullName?.charAt(0) || "U"}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6" fontWeight="600" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
                            {highlightSearchTerm(user.fullName, searchTerm)}
                          </Typography>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Chip
                              label={user.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                              size="small"
                              sx={{
                                backgroundColor: user.isActive
                                  ? "rgba(76, 175, 80, 0.1)"
                                  : "rgba(244, 67, 54, 0.1)",
                                color: user.isActive
                                  ? "#4caf50"
                                  : "#f44336",
                                cursor: "pointer",
                                fontSize: '0.75rem',
                                height: 24
                              }}
                              onClick={() =>
                                handleToggleUserStatus(user.id, user.isActive)
                              }
                            />
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box display="flex" flexDirection="column" gap={1.5}>
                        <Box display="flex" alignItems="center">
                          <EmailIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {highlightSearchTerm(user.email, searchTerm)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {highlightSearchTerm(user.phone || "Không có", searchTerm)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ fontSize: '0.875rem', minWidth: 100 }}
                          >
                            Vai trò:
                          </Typography>
                          <Chip
                            label={getRoleLabel(user.roles?.name || 'STAFF')}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(63, 81, 181, 0.1)",
                              color: "#3f51b5",
                              fontSize: '0.75rem',
                              height: 20,
                              ml: 1
                            }}
                          />
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ fontSize: '0.875rem', minWidth: 100 }}
                          >
                            Tham gia:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', ml: 1 }}>
                            {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
                        <Button 
                          size="small" 
                          variant="contained"
                          color={user.isBanned ? "success" : "error"}
                          onClick={() => handleOpenBanConfirm(user.id, user.fullName, user.isBanned)}
                          sx={{ 
                            minWidth: 80,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            textTransform: 'none',
                            px: 2,
                            '&:hover': { 
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </Button>
                      </Box>
                    </Paper>
                  ))}
              </Box>
            )}
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 20, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={pageSize || rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': {
              px: { xs: 1, sm: 2 },
              minHeight: { xs: 52, sm: 52 },
              justifyContent: 'center', // Center the pagination toolbar
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 }
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            },
            '& .MuiTablePagination-select': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            },
            '& .MuiTablePagination-spacer': {
              display: 'none' // Hide the spacer that pushes content to the right
            },
            '& .MuiTablePagination-actions': {
              ml: 0 // Remove left margin from pagination actions
            }
          }}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile} // Full screen on mobile
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 }, // No border radius on mobile
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            minHeight: { xs: '100vh', sm: '600px' }, // Full height on mobile
            margin: { xs: 0, sm: 2 }, // Remove margin on mobile
            maxHeight: { xs: '100vh', sm: '90vh' }
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1.5, sm: 2 },
            pt: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: { xs: "1.2rem", sm: "1.4rem" },
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Tạo Người Dùng Mới
        </DialogTitle>
        <DialogContent 
          sx={{ 
            px: { xs: 2, sm: 4 }, 
            py: { xs: 2, sm: 3 },
            flex: 1,
            overflow: 'auto'
          }}
        >
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                label="Họ tên *"
                fullWidth
                variant="outlined"
                value={createUserForm.fullName}
                onChange={(e) => handleCreateUserFormChange('fullName', e.target.value)}
                error={Boolean(createUserErrors.fullName)}
                helperText={createUserErrors.fullName}
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  mt: { xs: 1, sm: 2 },
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '14px', sm: '16px' }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Email *"
                type="email"
                fullWidth
                variant="outlined"
                value={createUserForm.email}
                onChange={(e) => handleCreateUserFormChange('email', e.target.value)}
                error={Boolean(createUserErrors.email) || (createUserForm.email && !emailValidation.isValid)}
                helperText={
                  createUserErrors.email || 
                  (createUserForm.email && emailValidation.error) || 
                  ""
                }
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: { xs: 0.5, sm: 1 }, 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <EmailIcon 
                        color={
                          createUserForm.email === '' ? 'action' :
                          emailValidation.isValid ? 'success' : 'error'
                        }
                        sx={{ fontSize: { xs: 18, sm: 20 } }}
                      />
                    </Box>
                  ),
                  endAdornment: createUserForm.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {emailValidation.isValid ? (
                        <CheckCircleIcon 
                          sx={{ 
                            color: '#4caf50', 
                            fontSize: { xs: 18, sm: 20 },
                            animation: 'fadeIn 0.3s ease-in'
                          }} 
                        />
                      ) : (
                        emailValidation.error && (
                          <ErrorIcon 
                            sx={{ 
                              color: '#f44336', 
                              fontSize: { xs: 18, sm: 20 },
                              animation: 'shake 0.3s ease-in-out'
                            }} 
                          />
                        )
                      )}
                    </Box>
                  )
                }}
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                     mt: { xs: 1, sm: 2 },
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '14px', sm: '16px' }
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: createUserForm.email === '' ? undefined :
                        emailValidation.isValid ? '#4caf50' : '#f44336'
                    }
                  },
                  '& @keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'scale(0.8)' },
                    '100%': { opacity: 1, transform: 'scale(1)' }
                  },
                  '& @keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-2px)' },
                    '75%': { transform: 'translateX(2px)' }
                  }
                }}
              />
              
              {/* Email validation indicators */}
              {createUserForm.email && (
                <Box sx={{ 
                  mt: 0.5, 
                  pl: { xs: 0.5, sm: 1 }, 
                  mb: { xs: 1, sm: 1.5 } 
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.5, sm: 1 },
                      animation: 'fadeIn 0.3s ease-in',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 5, sm: 6 },
                        height: { xs: 5, sm: 6 },
                        borderRadius: '50%',
                        backgroundColor: emailValidation.isValid ? '#4caf50' : '#f44336',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: emailValidation.isValid ? '#4caf50' : '#f44336',
                        fontWeight: 'medium',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {emailValidation.isValid ? 'Email hợp lệ' : emailValidation.error}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Số điện thoại *"
                fullWidth
                variant="outlined"
                value={createUserForm.phone}
                onChange={(e) => handleCreateUserFormChange('phone', e.target.value)}
                error={Boolean(createUserErrors.phone) || (createUserForm.phone && !phoneValidation.isValid)}
                helperText={
                  createUserErrors.phone || 
                  (createUserForm.phone && phoneValidation.error) || 
                  ""
                }
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: { xs: 0.5, sm: 1 }, 
                      display: 'flex', 
                      alignItems: 'center' 
                    }}>
                      <PhoneIcon 
                        color={
                          createUserForm.phone === '' ? 'action' :
                          phoneValidation.isValid ? 'success' : 'error'
                        }
                        sx={{ fontSize: { xs: 18, sm: 20 } }}
                      />
                    </Box>
                  ),
                  endAdornment: createUserForm.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {phoneValidation.isValid ? (
                        <CheckCircleIcon 
                          sx={{ 
                            color: '#4caf50', 
                            fontSize: { xs: 18, sm: 20 },
                            animation: 'fadeIn 0.3s ease-in'
                          }} 
                        />
                      ) : (
                        phoneValidation.error && (
                          <ErrorIcon 
                            sx={{ 
                              color: '#f44336', 
                              fontSize: { xs: 18, sm: 20 },
                              animation: 'shake 0.3s ease-in-out'
                            }} 
                          />
                        )
                      )}
                    </Box>
                  )
                }}
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                     mt: { xs: 1, sm: 2 },
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '14px', sm: '16px' }
                  },
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: createUserForm.phone === '' ? undefined :
                        phoneValidation.isValid ? '#4caf50' : '#f44336'
                    }
                  },
                  '& @keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'scale(0.8)' },
                    '100%': { opacity: 1, transform: 'scale(1)' }
                  },
                  '& @keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-2px)' },
                    '75%': { transform: 'translateX(2px)' }
                  }
                }}
              />
              
              {/* Phone validation indicators */}
              {createUserForm.phone && (
                <Box sx={{ 
                  mt: 0.5, 
                  pl: { xs: 0.5, sm: 1 }, 
                  mb: { xs: 1, sm: 1.5 } 
                }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 0.5, sm: 1 },
                      animation: 'fadeIn 0.3s ease-in',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 5, sm: 6 },
                        height: { xs: 5, sm: 6 },
                        borderRadius: '50%',
                        backgroundColor: phoneValidation.isValid ? '#4caf50' : '#f44336',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: phoneValidation.isValid ? '#4caf50' : '#f44336',
                        fontWeight: 'medium',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {phoneValidation.isValid ? 'Số điện thoại hợp lệ' : phoneValidation.error}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mật khẩu *"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                value={createUserForm.password}
                onChange={(e) => handleCreateUserFormChange('password', e.target.value)}
                error={Boolean(createUserErrors.password)}
                helperText={createUserErrors.password}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ mr: { xs: 0, sm: 1 } }}
                    >
                      {showPassword ? 
                        <VisibilityOffIcon sx={{ fontSize: { xs: 18, sm: 20 } }} /> : 
                        <VisibilityIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                      }
                    </IconButton>
                  ),
                }}
                sx={{ 
                  mb: { xs: 1.5, sm: 2 },
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '14px', sm: '16px' }
                  }
                }}
              />

              {/* Password validation indicators */}
              {createUserForm.password && (
                <Box sx={{ 
                  mt: { xs: 0.5, sm: 1 }, 
                  p: { xs: 1.5, sm: 2 }, 
                  bgcolor: 'grey.50', 
                  borderRadius: { xs: 1.5, sm: 2 }, 
                  border: '1px solid', 
                  borderColor: 'grey.200', 
                  mb: { xs: 1.5, sm: 2 } 
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'grey.700', 
                      mb: { xs: 1, sm: 1.5 }, 
                      display: 'block',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    🔒 Yêu cầu mật khẩu:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: { xs: 0.75, sm: 1 } 
                  }}>
                    {[
                      { key: 'length', label: 'Ít nhất 7 ký tự', valid: passwordValidation.length },
                      { key: 'hasLetter', label: 'Có chữ cái (A-Z, a-z)', valid: passwordValidation.hasLetter },
                      { key: 'hasNumber', label: 'Có số (0-9)', valid: passwordValidation.hasNumber },
                      { key: 'hasSpecial', label: 'Có ký tự đặc biệt (@$!%*#?&)', valid: passwordValidation.hasSpecial }
                    ].map((requirement) => (
                      <Box
                        key={requirement.key}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 0.75, sm: 1 }
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 16, sm: 18 },
                            height: { xs: 16, sm: 18 },
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '10px', sm: '12px' },
                            fontWeight: 'bold',
                            bgcolor: requirement.valid ? 'success.main' : 'grey.300',
                            color: 'white',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {requirement.valid ? '✓' : '○'}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ 
                            color: requirement.valid ? 'success.main' : 'grey.500',
                            fontWeight: requirement.valid ? 600 : 400,
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {requirement.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                  Vai trò *
                </InputLabel>
                <Select
                  value={createUserForm.roleName}
                  onChange={(e) => handleCreateUserFormChange('roleName', e.target.value)}
                  label="Vai trò *"
                  error={Boolean(createUserErrors.roleName)}
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: { xs: '14px', sm: '16px' },
                      py: { xs: 1.25, sm: 1.5 }
                    }
                  }}
                >
                  {availableRoles.map((role) => (
                    <MenuItem 
                      key={role.value} 
                      value={role.value}
                      sx={{ fontSize: { xs: '14px', sm: '16px' } }}
                    >
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
                {createUserErrors.roleName && (
                  <FormHelperText 
                    error
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {createUserErrors.roleName}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ 
                pt: { xs: 1, sm: 2 },
                display: 'flex',
                alignItems: 'center'
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={createUserForm.isActive}
                      onChange={(e) => handleCreateUserFormChange('isActive', e.target.checked)}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: { xs: '14px', sm: '16px' } }}>
                      Tài khoản hoạt động
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 4 }, 
          py: { xs: 2, sm: 3 }, 
          gap: { xs: 1.5, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            onClick={handleCloseCreateDialog}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '14px', sm: '16px' },
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#bbb',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={usersStatus === 'loading'}
            startIcon={usersStatus === 'loading' ? 
              <CircularProgress size={16} sx={{ color: 'white' }} /> : 
              <AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
            }
            fullWidth={isMobile}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '14px', sm: '16px' },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              '&:hover': {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
              },
              '&:disabled': {
                background: "linear-gradient(135deg, #ccc 0%, #bbb 100%)",
                color: 'white'
              }
            }}
          >
            {usersStatus === 'loading' ? 'Đang tạo...' : 'Tạo Người Dùng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ban/Unban Confirmation Dialog */}
      <Dialog
        open={banConfirmDialog.open}
        onClose={handleCloseBanConfirm}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            pt: 3,
            px: 3,
            fontSize: "1.3rem",
            fontWeight: "600",
            textAlign: "center",
            color: banConfirmDialog.currentBanStatus ? '#4caf50' : '#f44336'
          }}
        >
          {banConfirmDialog.currentBanStatus ? '🔓 Xác nhận bỏ cấm' : '🚫 Xác nhận cấm người dùng'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center',
              fontSize: '1rem',
              color: 'text.primary',
              lineHeight: 1.6
            }}
          >
            Bạn có chắc chắn muốn{' '}
            <strong style={{ color: banConfirmDialog.currentBanStatus ? '#4caf50' : '#f44336' }}>
              {banConfirmDialog.currentBanStatus ? 'bỏ cấm' : 'cấm'}
            </strong>{' '}
            người dùng{' '}
            <strong>"{banConfirmDialog.userName}"</strong>?
          </Typography>
          {!banConfirmDialog.currentBanStatus && (
            <Alert 
              severity="warning" 
              sx={{ 
                mt: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem'
                }
              }}
            >
              Người dùng sẽ không thể đăng nhập vào hệ thống khi bị cấm.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, gap: 2, justifyContent: 'center' }}>
          <Button
            onClick={handleCloseBanConfirm}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#bbb',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmBanUser}
            variant="contained"
            color={banConfirmDialog.currentBanStatus ? "success" : "error"}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: `0 4px 15px ${banConfirmDialog.currentBanStatus ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
              '&:hover': {
                boxShadow: `0 6px 20px ${banConfirmDialog.currentBanStatus ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)'}`,
              }
            }}
          >
            {banConfirmDialog.currentBanStatus ? 'Bỏ cấm' : 'Cấm người dùng'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            maxWidth: { xs: '90vw', sm: '400px' },
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManager;
