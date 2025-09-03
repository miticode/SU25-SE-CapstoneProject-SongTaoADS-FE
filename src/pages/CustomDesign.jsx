import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerChoiceSizesByCustomerChoiceId,
  selectCustomerChoiceSizes,
  fetchCustomerChoiceDetailsByCustomerChoiceId,
  selectCustomerChoiceDetailsList,
  fetchCustomerDetailByUserId,
  fetchCustomerChoice,
} from "../store/features/customer/customerSlice";
import { getProductTypesApi } from "../api/productTypeService";
import {
  FaBuilding,
  FaPalette,
  FaListAlt,
  FaRegStickyNote,
  FaHammer,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

import { createCustomDesignRequest } from "../store/features/customeDesign/customerDesignSlice";
import { fetchProfile, selectAuthUser } from "../store/features/auth/authSlice";
import { fetchImageFromS3, selectS3Image } from "../store/features/s3/s3Slice";
import { getAttributeValueByIdApi } from "../api/attributeValueService";

const CustomDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Scroll to top whenever this page is mounted
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, []);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const customerChoiceSizes = useSelector(selectCustomerChoiceSizes);
  const customerChoiceDetailsList = useSelector(
    selectCustomerChoiceDetailsList
  );
  const [note, setNote] = useState("");
  const customDesignOrderError = useSelector(
    (state) => state.customers?.customDesignOrderError
  );
  const customerDetail = useSelector(
    (state) => state.customers?.customerDetail
  );
  const currentOrder = useSelector((state) => state.customers?.currentOrder);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [hasOrder, setHasOrder] = useState(false);
  // Danh sách thuộc tính đã được làm giàu (bổ sung unitPrice, isMultiplier)
  const [enrichedAttributes, setEnrichedAttributes] = useState([]);
  const [isEnriching, setIsEnriching] = useState(false);

  // Lấy user từ Redux auth
  const user = useSelector(selectAuthUser);
  const accessToken = useSelector((state) => state.auth.accessToken);

  // Lấy logo từ S3
  const logoUrl = useSelector((state) =>
    customerDetail?.logoUrl
      ? selectS3Image(state, customerDetail.logoUrl)
      : null
  );

  // Lấy orderType từ localStorage để điều khiển hiển thị nút thi công
  const orderTypeFromStorage = localStorage.getItem("orderTypeForNewOrder");

  // Khi vào trang, nếu có customerChoiceId thì fetch kích thước và thuộc tính
  useEffect(() => {
    const id = location.state?.customerChoiceId;
    if (id) {
      dispatch(fetchCustomerChoiceSizesByCustomerChoiceId(id));
      dispatch(fetchCustomerChoiceDetailsByCustomerChoiceId(id));
      dispatch(fetchCustomerChoice(id));
    }
    if (location.state?.selectedType) {
      if (typeof location.state.selectedType === "object") {
        setSelectedType(location.state.selectedType);
        setSelectedTypeId(location.state.selectedType.id);
      } else {
        setSelectedTypeId(location.state.selectedType);
      }
    }
  }, [location.state, dispatch]);

  // Fetch loại biển hiệu nếu chưa có
  useEffect(() => {
    if (productTypes.length === 0) {
      getProductTypesApi().then((res) => {
        if (res.success) setProductTypes(res.data);
      });
    }
  }, [productTypes.length]);

  // Khi có productTypes và chỉ có ID, tìm object đúng
  useEffect(() => {
    if (!selectedType && selectedTypeId && productTypes.length > 0) {
      const found = productTypes.find((pt) => pt.id === selectedTypeId);
      if (found) setSelectedType(found);
    }
  }, [selectedType, selectedTypeId, productTypes]);

  useEffect(() => {
    // Nếu chưa có user trong Redux nhưng có accessToken, fetch profile trước
    if (!user && accessToken) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user, accessToken]);

  useEffect(() => {
    // Lấy userId từ Redux user (UUID)
    if (user?.id) {
      dispatch(fetchCustomerDetailByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  // Tự động set hasOrder dựa trên orderType
  useEffect(() => {
    if (orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION") {
      setHasOrder(true);
    } else if (orderTypeFromStorage === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION") {
      setHasOrder(false);
    }
  }, [orderTypeFromStorage]);

  // Auto hide snackbar
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.open]);

  // Fetch logo từ S3 khi có logoUrl (S3 key)
  useEffect(() => {
    if (customerDetail?.logoUrl && !logoUrl) {
      // logoUrl trong response thực chất là S3 key, không phải URL trực tiếp
      console.log("Fetching logo from S3 with key:", customerDetail.logoUrl);
      dispatch(fetchImageFromS3(customerDetail.logoUrl));
    }
  }, [customerDetail?.logoUrl, logoUrl, dispatch]);

  // Debug log để kiểm tra dữ liệu
  useEffect(() => {
    console.log("CustomDesign - customerDetail:", customerDetail);
    console.log("CustomDesign - logoUrl from S3:", logoUrl);
  }, [customerDetail, logoUrl]);

  // Enrich attributeValues để có unitPrice & isMultiplier giống logic ở AIDesign (case 4)
  useEffect(() => {
    const enrich = async () => {
      if (!customerChoiceDetailsList || customerChoiceDetailsList.length === 0) {
        setEnrichedAttributes([]);
        return;
      }
      setIsEnriching(true);
      const cache = {};
      const result = await Promise.all(
        customerChoiceDetailsList.map(async (item) => {
          const av = item.attributeValues || {};
          // Nếu đã có unitPrice hoặc isMultiplier thì không cần fetch
          if (av.unitPrice !== undefined || av.isMultiplier !== undefined) {
            return item;
          }
          if (!av.id) return item;
          if (cache[av.id]) {
            return { ...item, attributeValues: { ...av, ...cache[av.id] } };
          }
          try {
            const { success, data } = await getAttributeValueByIdApi(av.id);
            if (success && data) {
              cache[av.id] = data;
              return { ...item, attributeValues: { ...av, ...data } };
            }
          } catch (e) {
            console.warn("Enrich attribute value failed", av.id, e);
          }
          return item;
        })
      );
      setEnrichedAttributes(result);
      setIsEnriching(false);
    };
    enrich();
  }, [customerChoiceDetailsList]);

  const handleConfirm = async () => {
    // Lấy customerChoiceId từ location.state hoặc currentOrder
    let customerChoiceId = location.state?.customerChoiceId || currentOrder?.id;

    // Nếu vẫn không có customerChoiceId, thử lấy từ localStorage
    if (!customerChoiceId) {
      const savedCustomDesignInfo = localStorage.getItem(
        "orderCustomDesignInfo"
      );
      if (savedCustomDesignInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomDesignInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error("Error parsing saved custom design info:", error);
        }
      }
    }

    // Nếu vẫn không có, thử lấy từ URL params hoặc localStorage khác
    if (!customerChoiceId) {
      const urlParams = new URLSearchParams(window.location.search);
      customerChoiceId = urlParams.get("customerChoiceId");
    }

    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem("orderAIDesignInfo");
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error("Error parsing saved order info:", error);
        }
      }
    }

    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem("orderFormData");
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error("Error parsing saved order form data:", error);
        }
      }
    }

    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem("orderCurrentStep");
      if (savedOrderInfo) {
        try {
          const parsedInfo = JSON.parse(savedOrderInfo);
          customerChoiceId = parsedInfo.customerChoiceId;
        } catch (error) {
          console.error("Error parsing saved order current step:", error);
        }
      }
    }

    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem("orderIdForNewOrder");
      if (savedOrderInfo) {
        customerChoiceId = savedOrderInfo;
      }
    }

    // Nếu vẫn không có, thử lấy từ localStorage khác
    if (!customerChoiceId) {
      const savedOrderInfo = localStorage.getItem("orderTypeForNewOrder");
      if (savedOrderInfo) {
        customerChoiceId = savedOrderInfo;
      }
    }

    console.log("CustomDesign - Debug handleConfirm:", {
      locationState: location.state,
      currentOrder: currentOrder,
      customerChoiceId: customerChoiceId,
      customerDetail: customerDetail,
    });

    if (!customerDetail?.id || !customerChoiceId) {
      setSnackbar({
        open: true,
        message: `Thiếu thông tin: ${!customerDetail?.id ? "Khách hàng" : ""} ${
          !customerChoiceId ? "Customer Choice" : ""
        }`,
        severity: "error",
      });
      return;
    }
    try {
      const result = await dispatch(
        createCustomDesignRequest({
          customerDetailId: customerDetail.id,
          customerChoiceId: customerChoiceId,
          data: {
            requirements: note || "",
            hasOrder: hasOrder,
          },
        })
      ).unwrap();

      if (result?.id) {
        // Kiểm tra localStorage để xem có orderId từ trang Order không
        const orderIdFromStorage = localStorage.getItem("orderIdForNewOrder");
        const orderTypeFromStorage = localStorage.getItem(
          "orderTypeForNewOrder"
        );

        console.log(
          "CustomDesign - Debug after create custom design request:",
          {
            resultId: result.id,
            orderIdFromStorage,
            orderTypeFromStorage,
            hasOrder,
          }
        );

        // Luôn sử dụng existing order nếu có orderIdFromStorage
        if (
          orderIdFromStorage &&
          (orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION" ||
            orderTypeFromStorage === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION")
        ) {
          console.log(
            "CustomDesign - Có orderIdFromStorage, chuyển đến step 2 của Order:",
            orderIdFromStorage
          );

          // Lưu thông tin Custom Design để sử dụng trong Order page
          const customDesignInfo = {
            isFromCustomDesign: true,
            customDesignRequestId: result.id,
            customerChoiceId: customerChoiceId,
            hasConstruction: hasOrder,
            requirements: note,
            selectedType: selectedType,
            customerDetail: customerDetail,
          };
          localStorage.setItem(
            "orderCustomDesignInfo",
            JSON.stringify(customDesignInfo)
          );

          // Cập nhật current step trong localStorage để Order component nhận biết
          localStorage.setItem("orderCurrentStep", "2");

          // Chuyển đến step 2 của trang Order với orderId có sẵn
          navigate("/order", {
            state: {
              fromCustomDesign: true,
              customerChoiceId: customerChoiceId,
              customDesignRequestId: result.id,
              hasConstruction: hasOrder,
              requirements: note,
              selectedType: selectedType,
              customerDetail: customerDetail,
              useExistingOrder: true,
              existingOrderId: orderIdFromStorage,
            },
          });
        } else {
          // Logic cũ: tạo order mới
          console.log(
            "CustomDesign - Không có orderIdFromStorage, tạo order mới"
          );

          // Reset current step về 1 cho order mới
          localStorage.setItem("orderCurrentStep", "1");

          navigate("/order", {
            state: {
              fromCustomDesign: true,
              customerChoiceId: customerChoiceId,
              customDesignRequestId: result.id,
              hasConstruction: hasOrder,
              requirements: note,
              selectedType: selectedType,
              customerDetail: customerDetail,
            },
          });
        }
      } else {
        setSnackbar({
          open: true,
          message: "Tạo yêu cầu thiết kế thủ công thành công!",
          severity: "success",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (error) {
      console.error("Lỗi tạo custom design request:", error);
      setSnackbar({
        open: true,
        message:
          customDesignOrderError || "Tạo yêu cầu thiết kế thủ công thất bại",
        severity: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
  <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thiết Kế Tùy Chỉnh
          </h1>
          <p className="text-gray-600">
            Xác nhận thông tin và tạo yêu cầu thiết kế
          </p>
        </div>

        {/* Notification for existing order */}
        {(() => {
          const existingOrderId = localStorage.getItem("orderIdForNewOrder");
          const existingOrderType = localStorage.getItem(
            "orderTypeForNewOrder"
          );
          const isFromCustomDesignOrder =
            existingOrderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION" ||
            existingOrderType === "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION";

          if (existingOrderId && isFromCustomDesignOrder) {
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <FaInfoCircle className="text-blue-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Đang tạo thêm thiết kế tùy chỉnh
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Bạn đang tạo thêm một thiết kế tùy chỉnh cho đơn hàng hiện
                      có.
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Order ID: {existingOrderId.slice(0, 8)}...
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {existingOrderType === "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                          ? "Có thi công"
                          : "Không thi công"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
          <form className="space-y-8">
            {/* Company Information Section */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center mb-4 group">
                <FaBuilding className="text-gray-500 mr-3 group-hover:text-blue-500 transition-colors duration-200" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  Thông Tin Doanh Nghiệp
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                    Tên doanh nghiệp
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm">
                    {customerDetail?.companyName || (
                      <span className="text-red-500 text-sm">
                        Chưa có thông tin
                      </span>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                    Liên hệ
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 hover:shadow-sm">
                    {customerDetail?.contactInfo || (
                      <span className="text-red-500 text-sm">
                        Chưa có thông tin
                      </span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                    Địa chỉ
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 hover:shadow-sm">
                    {customerDetail?.address || (
                      <span className="text-red-500 text-sm">
                        Chưa có thông tin
                      </span>
                    )}
                  </div>
                </div>

                {customerDetail?.logoUrl && (
                  <div className="md:col-span-2 group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                      Logo
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex justify-center hover:shadow-sm">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="h-16 object-contain hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="h-16 flex items-center justify-center text-gray-400">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <span className="ml-2">Đang tải logo...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Product Type Section */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center mb-4 group">
                <FaPalette className="text-gray-500 mr-3 group-hover:text-pink-500 transition-colors duration-200" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors duration-200">
                  Loại Biển Hiệu
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                    Tên loại biển hiệu
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200 hover:shadow-sm">
                    {selectedType?.name || (
                      <span className="text-orange-500 text-sm">Chưa chọn</span>
                    )}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">
                    Kích thước đã nhập
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 hover:shadow-sm">
                    {customerChoiceSizes?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customerChoiceSizes.map((sz) => (
                          <span
                            key={sz.id}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 transition-colors duration-200"
                          >
                            {sz.sizes?.name || sz.sizeId}: {sz.sizeValue}m
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-orange-500 text-sm">
                        Chưa nhập kích thước
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Attributes Section */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center mb-4 group">
                <FaListAlt className="text-gray-500 mr-3 group-hover:text-emerald-500 transition-colors duration-200" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200">
                  Thuộc Tính Đã Chọn
                </h2>
              </div>

              {(enrichedAttributes.length > 0
                ? enrichedAttributes
                : customerChoiceDetailsList) &&
              (enrichedAttributes.length > 0
                ? enrichedAttributes
                : customerChoiceDetailsList).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(enrichedAttributes.length > 0
                    ? enrichedAttributes
                    : customerChoiceDetailsList).map((attr) => (
                    <div
                      key={attr.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md transition-all duration-300 hover:scale-105 group cursor-pointer"
                    >
                      <h4 className="font-medium text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-200">
                        {attr.attributeValues?.description ||
                          attr.attributeValues?.name ||
                          attr.attributeValuesId}
                      </h4>
                      {(() => {
                        const av = attr.attributeValues || {};
                        const isMultiplier = av.isMultiplier === true;
                        const unitPrice = av.unitPrice;
                        if (isMultiplier && unitPrice !== undefined) {
                          const multiplier = unitPrice / 10; // giống logic AIDesign
                          return (
                            <span className="bg-purple-100 text-purple-700 text-sm px-2 py-1 rounded group-hover:bg-purple-200 transition-colors duration-200">
                              Hệ số: <span className="font-semibold">×{multiplier.toLocaleString('vi-VN')}</span>
                            </span>
                          );
                        }
                        // Mặc định hiển thị giá
                        const money = (attr.subTotal || 0).toLocaleString('vi-VN');
                        return (
                          <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded group-hover:bg-green-200 transition-colors duration-200">
                            Giá: <span className="font-semibold">{money} VND</span>
                          </span>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors duration-200">
                  <FaListAlt className="mx-auto text-gray-400 text-3xl mb-2" />
                  <p className="text-gray-500">{isEnriching ? 'Đang tải thuộc tính...' : 'Chưa chọn thuộc tính nào'}</p>
                  <p className="text-sm text-gray-400">
                    Vui lòng chọn các thuộc tính cần thiết
                  </p>
                </div>
              )}
            </div>
            {/* Design Requirements Section */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center mb-4 group">
                <FaRegStickyNote className="text-gray-500 mr-3 group-hover:text-amber-500 transition-colors duration-200" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-amber-600 transition-colors duration-200">
                  Yêu Cầu Thiết Kế
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 hover:text-gray-900 transition-colors duration-200">
                  Ghi chú đặc biệt (tùy chọn)
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập yêu cầu thiết kế đặc biệt nếu có..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none hover:border-amber-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>{" "}
            {/* Construction Option Section */}
            <div className="pb-6">
              <div className="flex items-center mb-4 group">
                <FaHammer className="text-gray-500 mr-3 group-hover:text-purple-500 transition-colors duration-200" />
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                  Lựa Chọn Thi Công
                </h2>
              </div>

              {/* Notification for predetermined choice - chỉ hiển thị khi KHÔNG có existing order */}
              {(orderTypeFromStorage === "CUSTOM_DESIGN_WITH_CONSTRUCTION" ||
                orderTypeFromStorage ===
                  "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION") &&
                !localStorage.getItem("orderIdForNewOrder") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-900 font-medium">
                      {orderTypeFromStorage ===
                      "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                        ? "🏗️ Đơn hàng của bạn đã bao gồm thi công"
                        : "🎨 Đơn hàng của bạn chỉ bao gồm thiết kế"}
                    </p>
                    <p className="text-blue-700 text-sm mt-1">
                      {orderTypeFromStorage ===
                      "CUSTOM_DESIGN_WITH_CONSTRUCTION"
                        ? "Lựa chọn thi công đã được xác định trước cho đơn hàng này."
                        : "Đơn hàng này chỉ yêu cầu dịch vụ thiết kế, không bao gồm thi công."}
                    </p>
                  </div>
                )}

              <div className="space-y-3">
                {/* Construction option */}
                {orderTypeFromStorage !==
                  "CUSTOM_DESIGN_WITHOUT_CONSTRUCTION" && (
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200 group">
                    <input
                      type="radio"
                      name="hasOrder"
                      value="yes"
                      checked={hasOrder}
                      onChange={() => setHasOrder(true)}
                      className="text-green-600 focus:ring-green-500 transition-colors duration-200"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900 group-hover:text-green-700 transition-colors duration-200">
                        Có thi công
                      </span>
                      <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-200">
                        (Bao gồm thiết kế + thi công)
                      </p>
                    </div>
                  </label>
                )}

                {/* Design only option */}
                {orderTypeFromStorage !== "CUSTOM_DESIGN_WITH_CONSTRUCTION" && (
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 group">
                    <input
                      type="radio"
                      name="hasOrder"
                      value="no"
                      checked={!hasOrder}
                      onChange={() => setHasOrder(false)}
                      className="text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                        Không thi công
                      </span>
                      <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-200">
                        (Chỉ thiết kế)
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
            {/* Submit Button */}
            <div className="flex justify-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  // Điều hướng về bước 4 của trang AI Design.
                  // AIDesign.jsx đọc query param ?step=billboard&type=PRODUCT_TYPE_ID để set currentStep=4.
                  const typeId = selectedTypeId || selectedType?.id;
                  if (typeId) {
                    navigate(`/ai-design?step=billboard&type=${typeId}`);
                  } else {
                    navigate('/ai-design?step=billboard');
                  }
                }}
                className="group inline-flex items-center px-6 py-3 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium shadow-md hover:shadow-lg hover:border-blue-400 hover:text-blue-600 transition-all duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Quay lại 
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FaCheckCircle className="mr-2" />
                Xác Nhận Thiết Kế
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
          <div
            className={`p-4 rounded-lg shadow-xl border-l-4 ${
              snackbar.severity === "success"
                ? "bg-green-50 text-green-800 border-green-500"
                : snackbar.severity === "error"
                ? "bg-red-50 text-red-800 border-red-500"
                : "bg-blue-50 text-blue-800 border-blue-500"
            } transition-all duration-300 hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{snackbar.message}</span>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 text-current hover:text-gray-600 transition-colors duration-200 transform hover:scale-110 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDesign;
