import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCustomerChoiceSizesByCustomerChoiceId,
  selectCustomerChoiceSizes,
  fetchCustomerChoiceDetailsByCustomerChoiceId,
  selectCustomerChoiceDetailsList,
  createCustomDesignOrder,
  selectCustomDesignOrderStatus,
  selectCustomDesignOrderError,
} from "../store/features/customer/customerSlice";
import { getProductTypesApi } from "../api/productTypeService";
import { getAllSizesApi } from "../api/sizeService";
import {
  getAttributesByProductTypeIdApi,
  getAttributeValuesByAttributeIdApi,
} from "../api/attributeService";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaRulerCombined, FaListAlt, FaRegStickyNote } from "react-icons/fa";

import { motion } from "framer-motion";
import {
  fetchAttributesByProductTypeId,
  selectAllAttributes,
} from "../store/features/attribute/attributeSlice";

const CustomDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
  });
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [productTypes, setProductTypes] = useState([]);
  const customerChoiceSizes = useSelector(selectCustomerChoiceSizes);
  const customerChoiceDetailsList = useSelector(
    selectCustomerChoiceDetailsList
  );
  const [sizeMap, setSizeMap] = useState({});
  const [attributeValueMap, setAttributeValueMap] = useState({});
  const [note, setNote] = useState("");
  const attributes = useSelector(selectAllAttributes);
  const [attributeMap, setAttributeMap] = useState({});
  const customDesignOrderStatus = useSelector(selectCustomDesignOrderStatus);
  const customDesignOrderError = useSelector(selectCustomDesignOrderError);
  const customerDetail = useSelector(
    (state) => state.customers?.customerDetail
  );
  const currentOrder = useSelector((state) => state.customers?.currentOrder);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Khi vào trang, nếu có customerChoiceId thì fetch kích thước và thuộc tính
  useEffect(() => {
    const id = location.state?.customerChoiceId;
    if (id) {
      dispatch(fetchCustomerChoiceSizesByCustomerChoiceId(id));
      dispatch(fetchCustomerChoiceDetailsByCustomerChoiceId(id));
    }
    if (location.state?.businessInfo)
      setBusinessInfo(location.state.businessInfo);
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

  // Fetch mapping size/attribute on mount or khi selectedType thay đổi
  useEffect(() => {
    getAllSizesApi().then((res) => {
      if (res.success) {
        const map = {};
        res.data.forEach((sz) => {
          map[sz.id] = sz.name;
        });
        setSizeMap(map);
      }
    });
    if (selectedType?.id) {
      getAttributesByProductTypeIdApi(selectedType.id).then((res) => {
        if (res.success) {
          const attrValMap = {};
          Promise.all(
            res.data.map((attr) =>
              getAttributeValuesByAttributeIdApi(attr.id).then((valRes) => {
                if (valRes.success) {
                  valRes.data.forEach((val) => {
                    attrValMap[val.id] = val.name || val.value;
                  });
                }
              })
            )
          ).then(() => {
            setAttributeValueMap(attrValMap);
          });
        }
      });
    }
  }, [selectedType]);

  // Gọi fetchAttributesByProductTypeId khi có selectedTypeId
  useEffect(() => {
    if (selectedTypeId) {
      dispatch(fetchAttributesByProductTypeId(selectedTypeId));
    }
  }, [selectedTypeId, dispatch]);

  // Thêm lại biến attributeMap và logic setAttributeMap trong useEffect như trước.
  useEffect(() => {
    if (attributes && attributes.length > 0) {
      const map = {};
      attributes.forEach((attr) => {
        map[attr.id] = attr.name;
      });
      setAttributeMap(map);
    }
  }, [attributes]);

  const handleConfirm = async () => {
    if (!customerDetail?.id || !currentOrder?.id) {
      setSnackbar({
        open: true,
        message: "Thiếu thông tin khách hàng hoặc đơn hàng.",
        severity: "error",
      });
      return;
    }
    try {
      await dispatch(
        createCustomDesignOrder({
          customerDetailId: customerDetail.id,
          customerChoiceId: currentOrder.id,
          requirements: note || "",
        })
      ).unwrap();
      setSnackbar({
        open: true,
        message: "Tạo đơn hàng thiết kế thủ công thành công!",
        severity: "success",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: customDesignOrderError || "Tạo đơn hàng thất bại",
        severity: "error",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white py-8 px-2 md:px-0 w-full"
    >
      <Box maxWidth="1200px" mx="auto" px={2}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          style={{
            fontWeight: 700,
            letterSpacing: 1,
            color: "var(--color-primary)",
            marginBottom: 20,
          }}
        >
          Thông tin thiết kế thủ công
        </Typography>
        {/* Thông tin doanh nghiệp */}
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="var(--color-secondary)"
            mb={2}
            align="left"
          >
            Thông tin doanh nghiệp
          </Typography>
          <Box
            component="dl"
            className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <dt className="font-medium text-gray-700">Tên doanh nghiệp:</dt>
            <dd className="col-span-2 text-black">
              {businessInfo?.companyName}
            </dd>
            <dt className="font-medium text-gray-700">Địa chỉ:</dt>
            <dd className="col-span-2 text-black">
              {businessInfo?.address || "-"}
            </dd>
            <dt className="font-medium text-gray-700">Liên hệ:</dt>
            <dd className="col-span-2 text-black">
              {businessInfo?.contactInfo}
            </dd>
            {businessInfo?.logoUrl && (
              <>
                <dt className="font-medium text-gray-700">Logo:</dt>
                <dd className="col-span-2">
                  <img
                    src={businessInfo.logoUrl}
                    alt="Logo"
                    style={{ maxHeight: 60, borderRadius: 10 }}
                  />
                </dd>
              </>
            )}
          </Box>
        </Box>
        {/* Loại biển hiệu */}
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="var(--color-secondary)"
            mb={2}
            align="left"
          >
            Loại biển hiệu
          </Typography>
          <Box
            component="dl"
            className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <dt className="font-medium text-gray-700">Tên loại biển hiệu:</dt>
            <dd className="col-span-2 text-black">
              {selectedType?.name || ""}
            </dd>
            <dt className="font-medium text-gray-700">Kích thước đã nhập:</dt>
            <dd className="col-span-2">
              {customerChoiceSizes?.length > 0 ? (
                customerChoiceSizes.map((sz) => (
                  <div key={sz.id} className="mb-1">
                    <span className="text-gray-700 font-semibold">
                      {sizeMap[sz.sizeId] || sz.sizeId}:
                    </span>{" "}
                    <span className="text-custom-primary font-bold">
                      {sz.sizeValue} m
                    </span>
                  </div>
                ))
              ) : (
                <span className="italic text-gray-400">
                  Chưa nhập kích thước
                </span>
              )}
            </dd>
          </Box>
        </Box>
        {/* Thuộc tính đã chọn */}
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="var(--color-secondary)"
            mb={2}
            align="left"
          >
            Thuộc tính đã chọn
          </Typography>
          <Box
            component="dl"
            className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            {customerChoiceDetailsList &&
            customerChoiceDetailsList.length > 0 ? (
              customerChoiceDetailsList.map((attr) => (
                <React.Fragment key={attr.id}>
                  <dt className="font-medium text-gray-700">
                    {attributeMap?.[attr.attributeId] || attr.attributeId}
                  </dt>
                  <dd className="col-span-2">
                    <span className="text-custom-primary font-semibold">
                      {attributeValueMap[attr.attributeValuesId] ||
                        attr.attributeValuesId}
                    </span>{" "}
                    <span className="text-green-700 font-bold">
                      (Giá: {attr.subTotal?.toLocaleString("vi-VN") || 0} VND)
                    </span>
                  </dd>
                </React.Fragment>
              ))
            ) : (
              <>
                <dt className="font-medium text-gray-700">-</dt>
                <dd className="col-span-2 italic text-gray-400">
                  Chưa chọn thuộc tính nào
                </dd>
              </>
            )}
          </Box>
        </Box>
        {/* Yêu cầu thiết kế */}
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="var(--color-secondary)"
            mb={2}
            align="left"
          >
            Yêu cầu Thiết Kế
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Nhập yêu cầu thiết kế đặc biệt (nếu có)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              background: "#fafafa",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
              fontSize: "1.05rem",
            }}
          />
        </Box>
        {/* Nút xác nhận */}
        <Box mt={6} mb={2} display="flex" justifyContent="flex-start">
          <motion.div
            whileHover={{ scale: 1.04 }}
            style={{ width: "100%", maxWidth: 320 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={handleConfirm}
              className="bg-custom-primary hover:bg-custom-secondary text-white font-bold rounded-full px-10 py-3 text-lg shadow-lg transition-all"
              sx={{
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: "1.15rem",
                letterSpacing: 1,
                minWidth: 220,
                width: "100%",
                boxShadow: 6,
                textTransform: "none",
                "&:hover": {
                  background: "var(--color-secondary)",
                  color: "#fff",
                  boxShadow: 12,
                },
              }}
              disabled={customDesignOrderStatus === "loading"}
            >
              {customDesignOrderStatus === "loading"
                ? "Đang xử lý..."
                : "Xác nhận"}
            </Button>
          </motion.div>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default CustomDesign;
