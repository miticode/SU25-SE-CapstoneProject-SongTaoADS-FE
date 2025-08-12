import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
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
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  ListItemText,
  ListItemButton,
  List,
  ListItem,
  Avatar,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  Menu,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import {
  fetchCostTypes,
  createCostType,
  fetchCostTypesByProductTypeId, // Thêm import này
  selectCostTypes,
  selectCostTypesLoading,
  selectCostTypesError,
  selectCostTypesPagination,
  selectProductTypeCostTypes, // Thêm import này
  selectProductTypeCostTypesStatus, // Thêm import này
  selectProductTypeCostTypesError, // Thêm import này
  clearError,
  clearProductTypeCostTypes,
  updateCostType, // Thêm import này
} from "../../store/features/costype/costypeSlice";
import {
  fetchProductTypes,
  selectAllProductTypes,
  selectProductTypeStatus,
} from "../../store/features/productType/productTypeSlice";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
  selectAttributeStatus,
} from "../../store/features/attribute/attributeSlice";
import {
  fetchProductTypeSizesByProductTypeId,
  selectProductTypeSizes,
  selectProductTypeSizesStatus,
} from "../../store/features/productType/productTypeSlice";

const CostTypeManager = () => {
  const dispatch = useDispatch();

  // Redux state
  const costTypes = useSelector(selectCostTypes);
  const loading = useSelector(selectCostTypesLoading);
  const error = useSelector(selectCostTypesError);
  const pagination = useSelector(selectCostTypesPagination);

  // Product Types state
  const productTypes = useSelector(selectAllProductTypes);
  const productTypesStatus = useSelector(selectProductTypeStatus);

  // Attributes state (for isCore = true)
  const attributes = useSelector(selectAllAttributes);
  const attributeStatus = useSelector(selectAttributeStatus);

  // Product Type Sizes state (for isCore = true)
  const productTypeSizes = useSelector(selectProductTypeSizes);
  const sizesStatus = useSelector(selectProductTypeSizesStatus);

  // Product Type Cost Types state (for isCore = false)
  const productTypeCostTypes = useSelector(selectProductTypeCostTypes);
  const productTypeCostTypesStatus = useSelector(
    selectProductTypeCostTypesStatus
  );
  const productTypeCostTypesError = useSelector(
    selectProductTypeCostTypesError
  );

  // Local state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState(0);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [productTypeSearchTerm, setProductTypeSearchTerm] = useState("");
  const [newCostType, setNewCostType] = useState({
    name: "",
    description: "",
    formula: "",
    priority: 1,
    isCore: false,
    isAvailable: true,
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCostType, setEditingCostType] = useState(null);
  // Formula builder state
  const [showAttributes, setShowAttributes] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const formulaRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const steps = ["Chọn loại sản phẩm", "Nhập thông tin chi phí"];

  // Fetch data on component mount and when page/size changes
  useEffect(() => {
    dispatch(
      fetchCostTypes({
        page: page + 1,
        size: rowsPerPage,
      })
    );
  }, [dispatch, page, rowsPerPage]);

  // Fetch product types when dialog opens
  useEffect(() => {
    if (openDialog && productTypes.length === 0) {
      dispatch(fetchProductTypes({ page: 1, size: 100 }));
    }
  }, [dispatch, openDialog, productTypes.length]);

  // Fetch attributes/sizes/costTypes when product type is selected and isCore changes
  useEffect(() => {
    if (selectedProductType && dialogStep === 1) {
      if (newCostType.isCore) {
        // Fetch sizes and attributes for formula building (isCore = true)
        dispatch(fetchProductTypeSizesByProductTypeId(selectedProductType.id));
        dispatch(fetchAttributesByProductTypeId(selectedProductType.id));
      } else {
        // Fetch cost types của product type đã chọn (isCore = false)
        dispatch(fetchCostTypesByProductTypeId(selectedProductType.id));
      }
    }
  }, [dispatch, selectedProductType, newCostType.isCore, dialogStep]);

  // Clear product type cost types when dialog closes
  useEffect(() => {
    if (!openDialog) {
      dispatch(clearProductTypeCostTypes());
    }
  }, [dispatch, openDialog]);
  const handleEditCostType = (costType) => {
    setIsEditMode(true);
    setEditingCostType(costType);
    setSelectedProductType(costType.productTypes);
    setNewCostType({
      name: costType.name,
      description: costType.description,
      formula: costType.formula,
      priority: costType.priority,
      isCore: costType.isCore,
      isAvailable: costType.isAvailable,
    });
    setDialogStep(1); // Bỏ qua bước chọn product type
    setOpenDialog(true);
    setValidationErrors({});
    setShowAttributes(false);
    setShowSizes(false);
  };
  const validateForm = () => {
    const errors = {};

    // Validate tên loại chi phí
    if (!newCostType.name || newCostType.name.trim() === "") {
      errors.name = "Tên loại chi phí là bắt buộc";
    } else if (newCostType.name.trim().length < 2) {
      errors.name = "Tên loại chi phí phải có ít nhất 2 ký tự";
    } else if (newCostType.name.trim().length > 100) {
      errors.name = "Tên loại chi phí không được quá 100 ký tự";
    }

    // Validate mô tả
    if (!newCostType.description || newCostType.description.trim() === "") {
      errors.description = "Mô tả là bắt buộc";
    } else if (newCostType.description.trim().length < 5) {
      errors.description = "Mô tả phải có ít nhất 5 ký tự";
    } else if (newCostType.description.trim().length > 500) {
      errors.description = "Mô tả không được quá 500 ký tự";
    }

    // Validate công thức
    if (!newCostType.formula || newCostType.formula.trim() === "") {
      errors.formula = "Công thức tính toán là bắt buộc";
    } else if (newCostType.formula.trim().length < 3) {
      errors.formula = "Công thức phải có ít nhất 3 ký tự";
    }

    // Validate độ ưu tiên
    if (!newCostType.priority || newCostType.priority < 1) {
      errors.priority = "Độ ưu tiên phải lớn hơn 0";
    } else if (newCostType.priority > 999) {
      errors.priority = "Độ ưu tiên không được quá 999";
    }

    // Validate product type đã được chọn
    if (!selectedProductType) {
      errors.productType = "Bạn phải chọn loại sản phẩm";
    }

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    
    // Return both errors and validation result
    return { isValid, errors };
  };
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter cost types based on search term
  const filteredCostTypes = costTypes.filter(
    (costType) =>
      costType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costType.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costType.formula?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter product types based on search term
  const filteredProductTypes = productTypes.filter(
    (productType) =>
      productType.name
        ?.toLowerCase()
        .includes(productTypeSearchTerm.toLowerCase()) ||
      productType.description
        ?.toLowerCase()
        .includes(productTypeSearchTerm.toLowerCase())
  );

  // Handle refresh
  const handleRefresh = () => {
    dispatch(clearError());
    dispatch(
      fetchCostTypes({
        page: page + 1,
        size: rowsPerPage,
      })
    );
  };

  // Handle dialog open
  const handleOpenDialog = () => {
    setIsEditMode(false);
    setEditingCostType(null);
    setOpenDialog(true);
    setDialogStep(0);
    setSelectedProductType(null);
    setProductTypeSearchTerm("");
    setNewCostType({
      name: "",
      description: "",
      formula: "",
      priority: 1,
      isCore: false,
      isAvailable: true,
    });
    setShowAttributes(false);
    setShowSizes(false);
    setValidationErrors({});
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogStep(0);
    setSelectedProductType(null);
    setIsEditMode(false);
    setEditingCostType(null);
    setShowAttributes(false);
    setShowSizes(false);
    setValidationErrors({});
    setIsSubmitting(false);
  };
  const isFormValid = () => {
    // Kiểm tra các điều kiện cơ bản
    const basicConditions = (
      selectedProductType &&
      newCostType.name.trim() &&
      newCostType.description.trim() &&
      newCostType.formula.trim() &&
      newCostType.priority > 0
    );
    
    // Kiểm tra không có lỗi validation (chỉ tính các lỗi thực sự, không tính undefined)
    const hasValidationErrors = Object.values(validationErrors).some(error => 
      error !== undefined && error !== null && error.trim() !== ""
    );
    
    const isValid = basicConditions && !hasValidationErrors;
    
    // Debug logging
    console.log("Form validation check:", {
      basicConditions,
      hasValidationErrors,
      validationErrors,
      isValid
    });
    
    return isValid;
  };
  // Handle form input change
  const handleInputChange = (field, value) => {
    setNewCostType((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field]; // Xóa hoàn toàn thay vì set undefined
        return newErrors;
      });
    }

    // Reset formula when switching between core/non-core
    if (field === "isCore") {
      setNewCostType((prev) => ({
        ...prev,
        [field]: value,
        formula: "", // Reset formula
      }));
      setShowAttributes(false);
      setShowSizes(false);
      // Clear formula validation error
      if (validationErrors.formula) {
        setValidationErrors((prev) => ({
          ...prev,
          formula: undefined,
        }));
      }
    }
  };

  // Handle product type selection
  const handleProductTypeSelect = (productType) => {
    setSelectedProductType(productType);
  };

  // Handle next step
  const handleNextStep = () => {
    if (selectedProductType) {
      setDialogStep(1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    setDialogStep(0);
  };

  // Handle submit
  const handleSubmit = async () => {
    // Validate form trước khi submit
    const { isValid, errors } = validateForm();
    if (!isValid) {
      // Scroll to first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(
        `[name="${firstErrorField}"]`
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const costTypeData = {
        name: newCostType.name.trim(),
        description: newCostType.description.trim(),
        formula: newCostType.formula.trim(),
        priority: parseInt(newCostType.priority),
        isCore: newCostType.isCore,
        isAvailable: newCostType.isAvailable,
      };

      let result;

      if (isEditMode && editingCostType) {
        // Update existing cost type
        console.log("Đang cập nhật cost type với dữ liệu:", {
          costTypeId: editingCostType.id,
          costTypeData,
        });

        result = await dispatch(
          updateCostType({
            costTypeId: editingCostType.id,
            costTypeData: costTypeData,
          })
        ).unwrap();

        console.log("Cập nhật loại chi phí thành công!", result);
      } else {
        // Create new cost type
        console.log("Đang tạo cost type với dữ liệu:", {
          productTypeId: selectedProductType.id,
          costTypeData,
        });

        result = await dispatch(
          createCostType({
            productTypeId: selectedProductType.id,
            costTypeData: costTypeData,
          })
        ).unwrap();

        console.log("Tạo loại chi phí thành công!", result);
      }

      // Đóng dialog
      handleCloseDialog();

      // Refresh danh sách cost types
      dispatch(
        fetchCostTypes({
          page: page + 1,
          size: rowsPerPage,
        })
      );
    } catch (error) {
      console.error("Lỗi khi xử lý loại chi phí:", error);

      // Hiển thị lỗi từ server
      setValidationErrors({
        submit:
          error.message ||
          `Có lỗi xảy ra khi ${
            isEditMode ? "cập nhật" : "tạo"
          } loại chi phí. Vui lòng thử lại.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formula builder functions
  const insertAttributeToFormula = (attribute) => {
    const attributeName = `#${attribute.name
      .toUpperCase()
      .replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      attributeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + attributeName.length,
          cursorPosition + attributeName.length
        );
      }
    }, 100);
  };

  const insertSizeToFormula = (sizeItem) => {
    const sizeName = `#${sizeItem.sizes.name
      .toUpperCase()
      .replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      sizeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + sizeName.length,
          cursorPosition + sizeName.length
        );
      }
    }, 100);
  };

  const insertCostTypeToFormula = (costType) => {
    const costTypeName = `#${costType.name.toUpperCase().replace(/\s+/g, "")}`;
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      costTypeName +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + costTypeName.length,
          cursorPosition + costTypeName.length
        );
      }
    }, 100);
  };

  const insertOperator = (operator) => {
    const cursorPosition =
      formulaRef.current?.selectionStart || newCostType.formula.length;
    const formulaText = newCostType.formula;

    const newFormula =
      formulaText.substring(0, cursorPosition) +
      ` ${operator} ` +
      formulaText.substring(cursorPosition);

    setNewCostType((prev) => ({
      ...prev,
      formula: newFormula,
    }));

    setTimeout(() => {
      if (formulaRef.current) {
        formulaRef.current.focus();
        formulaRef.current.setSelectionRange(
          cursorPosition + operator.length + 2,
          cursorPosition + operator.length + 2
        );
      }
    }, 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render product type selection step
  const renderProductTypeSelection = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Typography
          variant="h5"
          className="!font-bold !text-gray-800 !mb-2"
        >
          🏷️ Chọn loại sản phẩm
        </Typography>
        <Typography
          variant="body1"
          className="!text-gray-600"
        >
          Lựa chọn loại sản phẩm để tạo chi phí tương ứng
        </Typography>
      </div>

      {/* Search Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="!text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm loại sản phẩm..."
          value={productTypeSearchTerm}
          onChange={(e) => setProductTypeSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Product Types List */}
      <div className="border-2 border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="max-h-96 overflow-y-auto">
          {productTypesStatus === "loading" ? (
            <div className="flex items-center justify-center p-12">
              <CircularProgress size={32} className="text-emerald-600" />
              <Typography variant="body2" className="!ml-3 !text-gray-600">
                Đang tải danh sách loại sản phẩm...
              </Typography>
            </div>
          ) : filteredProductTypes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="!text-gray-400 !text-2xl" />
              </div>
              <Typography variant="h6" className="!text-gray-500 !mb-2">
                Không tìm thấy loại sản phẩm
              </Typography>
              <Typography variant="body2" className="!text-gray-400">
                Thử thay đổi từ khóa tìm kiếm
              </Typography>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredProductTypes.map((productType) => (
                <div
                  key={productType.id}
                  onClick={() => handleProductTypeSelect(productType)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-emerald-50 ${
                    selectedProductType?.id === productType.id
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-r-4 border-emerald-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        selectedProductType?.id === productType.id
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedProductType?.id === productType.id && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg ${
                      selectedProductType?.id === productType.id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      {productType.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Typography 
                        variant="h6" 
                        className={`!font-semibold !mb-1 ${
                          selectedProductType?.id === productType.id
                            ? '!text-emerald-700'
                            : '!text-gray-800'
                        }`}
                      >
                        {productType.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        className="!text-gray-500 !leading-relaxed"
                      >
                        {productType.description || "Chưa có mô tả"}
                      </Typography>
                    </div>

                    {/* Selection indicator */}
                    {selectedProductType?.id === productType.id && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {selectedProductType && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400 p-4 rounded-r-xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <Typography variant="body1" className="!font-semibold !text-emerald-800">
                Đã chọn loại sản phẩm
              </Typography>
              <Typography variant="body2" className="!text-emerald-600">
                <strong>{selectedProductType.name}</strong> - Sẵn sàng để tiếp tục
              </Typography>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render cost type form step
  const renderCostTypeForm = () => (
    <div className="space-y-6">
      {/* Product Type Info Banner */}
      {selectedProductType && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <Typography variant="body1" className="!font-semibold !text-blue-800">
                Tạo chi phí cho loại sản phẩm
              </Typography>
              <Typography variant="body2" className="!text-blue-600">
                <strong>{selectedProductType.name}</strong>
              </Typography>
            </div>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {validationErrors.submit && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <Typography variant="body2" className="!text-red-800">
              {validationErrors.submit}
            </Typography>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên loại chi phí */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Tên loại chi phí <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={newCostType.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            maxLength={100}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-200 ${
              validationErrors.name 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-emerald-500'
            }`}
            placeholder="Nhập tên loại chi phí"
          />
          {validationErrors.name && (
            <Typography variant="caption" className="!text-red-500">
              {validationErrors.name}
            </Typography>
          )}
        </div>

        {/* Độ ưu tiên */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Độ ưu tiên <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="priority"
            value={newCostType.priority}
            onChange={(e) => handleInputChange("priority", parseInt(e.target.value) || 0)}
            min={1}
            max={999}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-200 ${
              validationErrors.priority 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-emerald-500'
            }`}
            placeholder="1-999"
          />
          <Typography variant="caption" className={validationErrors.priority ? "!text-red-500" : "!text-gray-500"}>
            {validationErrors.priority || "Từ 1 đến 999"}
          </Typography>
        </div>
      </div>

      {/* Mô tả - Full width */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Mô tả <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={newCostType.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={3}
          maxLength={500}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-200 resize-none ${
            validationErrors.description 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-emerald-500'
          }`}
          placeholder="Nhập mô tả cho loại chi phí"
        />
        <div className="flex justify-between items-center">
          {validationErrors.description ? (
            <Typography variant="caption" className="!text-red-500">
              {validationErrors.description}
            </Typography>
          ) : (
            <span></span>
          )}
          <Typography variant="caption" className="!text-gray-500">
            {newCostType.description.length}/500 ký tự
          </Typography>
        </div>
      </div>

      {/* Toggle Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chi phí cốt lõi */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
          newCostType.isCore 
            ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                newCostType.isCore ? 'bg-orange-100' : 'bg-gray-200'
              }`}>
                {newCostType.isCore ? '🎯' : '📊'}
              </div>
              <div>
                <Typography variant="body1" className="!font-semibold !text-gray-800">
                  Chi phí cốt lõi
                </Typography>
                <Typography variant="caption" className="!text-gray-600">
                  {newCostType.isCore
                    ? "Sử dụng thuộc tính & kích thước"
                    : "Sử dụng các loại chi phí hiện có"}
                </Typography>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange("isCore", !newCostType.isCore)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                newCostType.isCore ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                newCostType.isCore ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Đang hoạt động */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
          newCostType.isAvailable 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                newCostType.isAvailable ? 'bg-emerald-100' : 'bg-gray-200'
              }`}>
                {newCostType.isAvailable ? '✅' : '⏸️'}
              </div>
              <div>
                <Typography variant="body1" className="!font-semibold !text-gray-800">
                  Đang hoạt động
                </Typography>
                <Typography variant="caption" className="!text-gray-600">
                  {newCostType.isAvailable ? "Sẵn sàng sử dụng" : "Tạm dừng hoạt động"}
                </Typography>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleInputChange("isAvailable", !newCostType.isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                newCostType.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                newCostType.isAvailable ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Công thức tính */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Công thức tính toán <span className="text-red-500">*</span>
        </label>
        <textarea
          ref={formulaRef}
          name="formula"
          value={newCostType.formula}
          onChange={(e) => handleInputChange("formula", e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-200 transition-all duration-200 font-mono text-sm resize-none ${
            validationErrors.formula 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-200 focus:border-emerald-500'
          }`}
          placeholder="Nhập công thức tính toán"
        />
        <div className="text-sm text-gray-600">
          {validationErrors.formula ? (
            <Typography variant="caption" className="!text-red-500">
              {validationErrors.formula}
            </Typography>
          ) : (
            <Typography variant="caption" className="!text-gray-600">
              {newCostType.isCore
                ? "Chi phí cốt lõi: Sử dụng thuộc tính và kích thước để tạo công thức"
                : "Chi phí thường: Sử dụng các loại chi phí hiện có của loại sản phẩm này"}
            </Typography>
          )}
        </div>
      </div>

      {/* Công cụ hỗ trợ */}
      <div className={`p-4 rounded-2xl border-2 ${
        newCostType.isCore ? 'bg-orange-50 border-orange-200' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex flex-wrap gap-3">
          <Typography variant="body2" className="!font-semibold !text-gray-700 w-full mb-2">
            🛠️ Công cụ hỗ trợ:
          </Typography>

          {/* Nút chọn thuộc tính (cho isCore = true) */}
          {newCostType.isCore && (
            <button
              type="button"
              onClick={() => setShowAttributes(!showAttributes)}
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                showAttributes
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {showAttributes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              {showAttributes ? "Ẩn thuộc tính" : "Chọn thuộc tính"}
            </button>
          )}

          {/* Nút chọn kích thước (cho isCore = true) */}
          {newCostType.isCore && (
            <button
              type="button"
              onClick={() => setShowSizes(!showSizes)}
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                showSizes
                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                  : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'
              }`}
            >
              {showSizes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              {showSizes ? "Ẩn kích thước" : "Xem kích thước"}
            </button>
          )}

          {/* Nút chọn loại chi phí (cho isCore = false) */}
          {!newCostType.isCore && (
            <button
              type="button"
              onClick={() => setShowAttributes(!showAttributes)}
              className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                showAttributes
                  ? 'bg-orange-100 border-orange-300 text-orange-700'
                  : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
              }`}
            >
              {showAttributes ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              {showAttributes ? "Ẩn loại chi phí" : "Chọn loại chi phí"}
            </button>
          )}

          {/* Dropdown phép tính */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              className="px-4 py-2 bg-white border-2 border-cyan-200 text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              Phép tính
              <ArrowDropDownIcon />
            </button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                className: "!shadow-2xl !border !border-gray-100 !rounded-2xl !mt-2"
              }}
            >
              {[
                { symbol: '+', name: 'Cộng' },
                { symbol: '-', name: 'Trừ' },
                { symbol: '*', name: 'Nhân' },
                { symbol: '/', name: 'Chia' },
                { symbol: '(', name: '(' },
                { symbol: ')', name: ')' }
              ].map((op, index) => (
                <MenuItem
                  key={op.symbol}
                  onClick={() => {
                    insertOperator(op.symbol);
                    setAnchorEl(null);
                  }}
                  className={`${index === 4 ? '!border-t !border-gray-200 !mt-1 !pt-2' : ''}`}
                >
                  <Typography className="!font-mono !font-bold">
                    {op.symbol} {op.name && `(${op.name})`}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </div>
        </div>
      </div>

      {/* Danh sách thuộc tính (cho isCore = true) */}
      {newCostType.isCore && (
        <div className={`overflow-hidden transition-all duration-300 ${showAttributes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-2 border-blue-100 rounded-2xl bg-blue-50">
            <div className="max-h-64 overflow-y-auto">
              {attributeStatus === "loading" && (
                <div className="flex items-center justify-center p-8">
                  <CircularProgress size={24} className="text-blue-600 mr-2" />
                  <Typography variant="body2" className="!text-blue-700">
                    Đang tải thuộc tính...
                  </Typography>
                </div>
              )}

              {attributeStatus === "failed" && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <Typography variant="body2" className="!text-red-600">
                      Không thể tải thuộc tính
                    </Typography>
                  </div>
                </div>
              )}

              {attributeStatus === "succeeded" && attributes.length === 0 && (
                <div className="p-8 text-center">
                  <Typography variant="body2" className="!text-blue-600">
                    Không có thuộc tính cho loại biển hiệu này
                  </Typography>
                </div>
              )}

              {attributeStatus === "succeeded" && attributes.length > 0 && (
                <div className="divide-y divide-blue-100">
                  {attributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      onClick={() => insertAttributeToFormula(attribute)}
                      className="p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Typography className="!font-medium !text-blue-800">
                        {attribute.name}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Danh sách kích thước (cho isCore = true) */}
      {newCostType.isCore && (
        <div className={`overflow-hidden transition-all duration-300 ${showSizes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-2 border-purple-100 rounded-2xl bg-purple-50">
            <div className="max-h-64 overflow-y-auto">
              {sizesStatus === "loading" && (
                <div className="flex items-center justify-center p-8">
                  <CircularProgress size={24} className="text-purple-600 mr-2" />
                  <Typography variant="body2" className="!text-purple-700">
                    Đang tải kích thước...
                  </Typography>
                </div>
              )}

              {sizesStatus === "failed" && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <Typography variant="body2" className="!text-red-600">
                      Không thể tải kích thước
                    </Typography>
                  </div>
                </div>
              )}

              {sizesStatus === "succeeded" && productTypeSizes.length === 0 && (
                <div className="p-8 text-center">
                  <Typography variant="body2" className="!text-purple-600">
                    Không có kích thước nào cho loại biển hiệu này
                  </Typography>
                </div>
              )}

              {sizesStatus === "succeeded" && productTypeSizes.length > 0 && (
                <div className="divide-y divide-purple-100">
                  {productTypeSizes.map((sizeItem) => {
                    const sizeData = sizeItem.sizes || {};
                    return (
                      <div
                        key={sizeItem.id}
                        onClick={() => insertSizeToFormula(sizeItem)}
                        className="p-4 cursor-pointer hover:bg-purple-100 transition-colors duration-200"
                      >
                        <Typography className="!font-medium !text-purple-800">
                          {sizeData.name || "Không xác định"}
                        </Typography>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Danh sách loại chi phí của product type (cho isCore = false) */}
      {!newCostType.isCore && (
        <div className={`overflow-hidden transition-all duration-300 ${showAttributes ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-2 border-orange-100 rounded-2xl bg-orange-50">
            <div className="max-h-64 overflow-y-auto">
              {productTypeCostTypesStatus === "loading" && (
                <div className="flex items-center justify-center p-8">
                  <CircularProgress size={24} className="text-orange-600 mr-2" />
                  <Typography variant="body2" className="!text-orange-700">
                    Đang tải loại chi phí của {selectedProductType?.name}...
                  </Typography>
                </div>
              )}

              {productTypeCostTypesStatus === "failed" && (
                <div className="p-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <Typography variant="body2" className="!text-red-600">
                      Không thể tải loại chi phí: {productTypeCostTypesError}
                    </Typography>
                  </div>
                </div>
              )}

              {productTypeCostTypesStatus === "succeeded" && productTypeCostTypes.length === 0 && (
                <div className="p-8 text-center">
                  <Typography variant="body2" className="!text-orange-600 !mb-2">
                    Chưa có loại chi phí nào cho loại sản phẩm{" "}
                    <strong>{selectedProductType?.name}</strong>
                  </Typography>
                  <Typography variant="caption" className="!text-orange-500">
                    Hãy tạo chi phí cốt lõi trước khi tạo chi phí thường
                  </Typography>
                </div>
              )}

              {productTypeCostTypesStatus === "succeeded" && productTypeCostTypes.length > 0 && (
                <div className="divide-y divide-orange-100">
                  {productTypeCostTypes.map((costType) => (
                    <div
                      key={costType.id}
                      onClick={() => insertCostTypeToFormula(costType)}
                      className="p-4 cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Typography className="!font-medium !text-orange-800">
                          {costType.name}
                        </Typography>
                        {costType.isCore && (
                          <span className="px-2 py-1 bg-orange-200 text-orange-700 text-xs rounded-full font-medium">
                            Cốt lõi
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Độ ưu tiên: {costType.priority}
                        </span>
                      </div>
                      <Typography variant="caption" className="!text-orange-600 !block !mb-1">
                        {costType.description || "Không có mô tả"}
                      </Typography>
                      <Typography variant="caption" className="!text-orange-600 !font-mono !block">
                        Công thức: {costType.formula || "Chưa có công thức"}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Thông tin và ví dụ */}
      <div className="bg-gradient-to-r from-lime-50 to-yellow-50 p-4 rounded-2xl border-2 border-lime-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center mt-1">
            <InfoOutlinedIcon className="!text-lime-600 !text-lg" />
          </div>
          <div className="flex-1">
            <Typography variant="subtitle2" className="!font-semibold !text-lime-800 !mb-3">
              💡 Ví dụ công thức
            </Typography>
            <div className="flex flex-wrap gap-2">
              {newCostType.isCore ? (
                <>
                  <span className="px-3 py-2 bg-lime-100 rounded-lg font-mono text-sm text-lime-700 border border-lime-200">
                    #CAO * #RONG * #SOLUONG
                  </span>
                  <span className="px-3 py-2 bg-lime-100 rounded-lg font-mono text-sm text-lime-700 border border-lime-200">
                    (#CAO + #RONG) * 2 * #DONGIA
                  </span>
                </>
              ) : (
                <>
                  <span className="px-3 py-2 bg-lime-100 rounded-lg font-mono text-sm text-lime-700 border border-lime-200">
                    #VẬTTƯ + #NHÂNCÔNG
                  </span>
                  <span className="px-3 py-2 bg-lime-100 rounded-lg font-mono text-sm text-lime-700 border border-lime-200">
                    #VẬTTƯ * 1.2 + #NHÂNCÔNG
                  </span>
                  <span className="px-3 py-2 bg-lime-100 rounded-lg font-mono text-sm text-lime-700 border border-lime-200">
                    (#VẬTTƯ + #NHÂNCÔNG + #VẬNHÀNH) * 0.25
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1 }}
        >
          Quản lý loại chi phí
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Quản lý các loại chi phí trong hệ thống
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
              color: "white",
              "&:hover": {
                transform: "translateY(-2px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {pagination.totalElements || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Tổng loại chi phí
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #388e3c 30%, #66bb6a 90%)",
              color: "white",
              "&:hover": {
                transform: "translateY(-2px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {costTypes.filter((ct) => ct.isAvailable).length || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #f57c00 30%, #ffb74d 90%)",
              color: "white",
              "&:hover": {
                transform: "translateY(-2px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {costTypes.filter((ct) => ct.isCore).length || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Chi phí cốt lõi
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(45deg, #0288d1 30%, #29b6f6 90%)",
              color: "white",
              "&:hover": {
                transform: "translateY(-2px)",
                transition: "all 0.3s ease",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {pagination.totalPages || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Tổng số trang
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <TextField
          placeholder="Tìm kiếm loại chi phí..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", sm: 350, md: 400 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "#2e7d32",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              "&:hover": { backgroundColor: "#1b5e20" },
            }}
            onClick={handleOpenDialog}
          >
            Thêm loại chi phí
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <TableContainer sx={{ maxHeight: { xs: 400, sm: 500, md: 600 } }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  Tên loại chi phí
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    display: { xs: "none", sm: "table-cell" },
                    fontSize: "0.875rem",
                  }}
                >
                  Mô tả
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    display: { xs: "none", md: "table-cell" },
                    fontSize: "0.875rem",
                  }}
                >
                  Công thức
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  Độ ưu tiên
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    display: { xs: "none", lg: "table-cell" },
                    fontSize: "0.875rem",
                  }}
                >
                  Loại sản phẩm
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    display: { xs: "none", lg: "table-cell" },
                    fontSize: "0.875rem",
                  }}
                >
                  Ngày tạo
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: "#f8f9fa",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    py: { xs: 1, sm: 2 },
                  }}
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={50} thickness={4} />
                      <Typography variant="body1" color="text.secondary">
                        Đang tải dữ liệu...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredCostTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        {searchTerm
                          ? "🔍 Không tìm thấy kết quả phù hợp"
                          : "📋 Chưa có dữ liệu"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm
                          ? "Thử thay đổi từ khóa tìm kiếm"
                          : "Hãy thêm loại chi phí đầu tiên"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCostTypes.map((costType) => (
                  <TableRow
                    key={costType.id}
                    hover
                    sx={{
                      "&:hover": { backgroundColor: "rgba(46, 125, 50, 0.04)" },
                      cursor: "pointer",
                    }}
                  >
                    {/* Responsive table cells */}
                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            mb: { xs: 0.5, sm: 0 },
                          }}
                        >
                          {costType.name}
                        </Typography>
                        {/* Mobile: hiển thị thông tin bổ sung */}
                        <Box
                          sx={{ display: { xs: "block", sm: "none" }, mt: 1 }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block" }}
                          >
                            {costType.description || "N/A"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              color: "primary.main",
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            {costType.formula || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Ẩn trên mobile */}
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {costType.description || "N/A"}
                      </Typography>
                    </TableCell>

                    {/* Ẩn trên tablet */}
                    <TableCell
                      sx={{ display: { xs: "none", md: "table-cell" } }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          maxWidth: 150,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          backgroundColor: "rgba(0,0,0,0.04)",
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        {costType.formula || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                      <Chip
                        label={costType.priority}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Chip
                          label={
                            costType.isAvailable
                              ? "Hoạt động"
                              : "Không hoạt động"
                          }
                          color={costType.isAvailable ? "success" : "error"}
                          size="small"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                        />
                        {costType.isCore && (
                          <Chip
                            label="Cốt lõi"
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    {/* Ẩn trên mobile & tablet */}
                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                    >
                      <Typography variant="body2">
                        {costType.productTypes?.name || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{ display: { xs: "none", lg: "table-cell" } }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(costType.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: { xs: 1, sm: 2 } }}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: { xs: 0.5, sm: 1 },
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          color="primary"
                          variant="outlined"
                          onClick={() => handleEditCostType(costType)} // Thêm onClick handler
                          sx={{
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            px: { xs: 1, sm: 2 },
                            textTransform: "none",
                            borderRadius: 1.5,
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ display: { xs: "none", sm: "inline" } }}
                          >
                            Sửa
                          </Box>
                        </Button>
                       
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Enhanced Pagination */}
        <Box
          sx={{
            borderTop: "1px solid rgba(224, 224, 224, 1)",
            backgroundColor: "#fafafa",
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={pagination.totalElements || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số hàng:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} / ${count !== -1 ? count : `${to}+`}`
            }
            sx={{
              "& .MuiTablePagination-toolbar": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                minHeight: { xs: 56, sm: 64 },
              },
              "& .MuiTablePagination-selectLabel": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
              "& .MuiTablePagination-displayedRows": {
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Multi-step Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "!rounded-2xl !shadow-2xl !max-h-[90vh]"
        }}
      >
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200 relative">
          <Typography 
            variant="h5" 
            className="!font-bold !text-gray-800 !pr-12"
          >
            {isEditMode
              ? "✏️ Chỉnh sửa loại chi phí"
              : dialogStep === 0
              ? "🏷️ Chọn loại sản phẩm"
              : "🎯 Tạo loại chi phí mới"}
          </Typography>
          <Typography 
            variant="body2" 
            className="!text-gray-600 !mt-1"
          >
            {isEditMode
              ? "Cập nhật thông tin loại chi phí đã chọn"
              : dialogStep === 0
              ? "Vui lòng chọn loại sản phẩm để tiếp tục"
              : "Điền thông tin chi tiết để tạo loại chi phí"}
          </Typography>
          
          <button
            onClick={handleCloseDialog}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors duration-200"
          >
            <CloseIcon className="!text-gray-700" />
          </button>
        </div>

        <div className="p-6 bg-white max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* Enhanced Stepper - Ẩn khi edit mode */}
          {!isEditMode && (
            <div className="mb-8">
              {/* Desktop Stepper */}
              <div className="hidden sm:flex items-center mb-6 px-4">
                {steps.map((label, index) => (
                  <React.Fragment key={label}>
                    {/* Step Circle and Label */}
                    <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 relative z-10 ${
                          index <= dialogStep
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index <= dialogStep ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="mt-3 text-center max-w-[140px]">
                        <div 
                          className={`text-sm font-semibold transition-colors duration-300 leading-tight ${
                            index <= dialogStep ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {label}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-6 min-w-[60px]">
                        <div 
                          className={`h-1 w-full rounded-full transition-all duration-500 ${
                            index < dialogStep 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                              : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Mobile Stepper */}
              <div className="block sm:hidden mb-6">
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Bước {dialogStep + 1} / {steps.length}
                    </span>
                    <span className="text-sm text-emerald-600 font-medium">
                      {Math.round(((dialogStep + 1) / steps.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((dialogStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Current Step Label */}
                <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {dialogStep + 1}
                    </div>
                    <span className="text-lg font-bold text-emerald-700">
                      {steps[dialogStep]}
                    </span>
                  </div>
                  <div className="text-sm text-emerald-600">
                    {dialogStep === 0 
                      ? "Chọn loại sản phẩm để tiếp tục" 
                      : "Hoàn thành thông tin chi phí"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional rendering based on step */}
          <div className="min-h-[400px]">
            {isEditMode || dialogStep === 1
              ? renderCostTypeForm()
              : renderProductTypeSelection()}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={handleCloseDialog}
              disabled={isSubmitting}
              className="order-3 sm:order-1 w-full sm:w-auto px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>

            {!isEditMode && dialogStep === 1 && (
              <button
                onClick={handlePreviousStep}
                disabled={isSubmitting}
                className="order-2 sm:order-2 w-full sm:w-auto px-6 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowBackIcon className="!text-sm" />
                Quay lại
              </button>
            )}

            {!isEditMode && dialogStep === 0 ? (
              <button
                onClick={handleNextStep}
                disabled={!selectedProductType || isSubmitting}
                className="order-1 sm:order-3 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
                <ArrowForwardIcon className="!text-sm" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="order-1 sm:order-3 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={18} className="text-white" />
                    {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <AddIcon className="!text-sm" />
                    {isEditMode ? "Cập nhật loại chi phí" : "Tạo loại chi phí"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Dialog>
    </Box>
  );
};

export default CostTypeManager;
