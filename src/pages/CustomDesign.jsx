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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { FaRulerCombined, FaListAlt, FaRegStickyNote } from "react-icons/fa";

import { createCustomDesignRequest } from "../store/features/customeDesign/customerDesignSlice";
import { createOrderFromDesignRequest } from "../store/features/order/orderSlice";
import { fetchProfile, selectAuthUser } from "../store/features/auth/authSlice";

const CustomDesign = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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

  // Lấy user từ Redux auth
  const user = useSelector(selectAuthUser);
  const accessToken = useSelector((state) => state.auth.accessToken);

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
      const result = await dispatch(
        createCustomDesignRequest({
          customerDetailId: customerDetail.id,
          customerChoiceId: currentOrder.id,
          data: {
            requirements: note || "",
            hasOrder: hasOrder,
          },
        })
      ).unwrap();
      
      if (result?.id) {
        // Luôn navigate đến Order.jsx sau khi tạo custom design request thành công
        // Dù có thi công hay không thi công
        navigate("/order", {
          state: {
            fromCustomDesign: true,
            customerChoiceId: currentOrder.id,
            customDesignRequestId: result.id,
            hasConstruction: hasOrder,
            requirements: note,
            selectedType: selectedType,
            customerDetail: customerDetail
          }
        });
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
    <div className="min-h-screen bg-white py-8 px-2 md:px-0 w-full">
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
              {customerDetail?.companyName || (
                <span className="text-red-500">
                  Chưa có thông tin doanh nghiệp
                </span>
              )}
            </dd>
            <dt className="font-medium text-gray-700">Địa chỉ:</dt>
            <dd className="col-span-2 text-black">
              {customerDetail?.address || (
                <span className="text-red-500">
                  Chưa có thông tin doanh nghiệp
                </span>
              )}
            </dd>
            <dt className="font-medium text-gray-700">Liên hệ:</dt>
            <dd className="col-span-2 text-black">
              {customerDetail?.contactInfo || (
                <span className="text-red-500">
                  Chưa có thông tin doanh nghiệp
                </span>
              )}
            </dd>
            {customerDetail?.logoUrl && (
              <>
                <dt className="font-medium text-gray-700">Logo:</dt>
                <dd className="col-span-2">
                  <img
                    src={customerDetail.logoUrl}
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
                      {sz.sizes?.name || sz.sizeId}:
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
                    {attr.attributeValues?.description ||
                      attr.attributeValues?.name ||
                      attr.attributeValuesId}
                  </dt>
                  <dd className="col-span-2">
                    <span className="text-custom-primary font-semibold">
                      {attr.attributeValues?.name || attr.attributeValuesId}
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
        <Box mb={4}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="var(--color-secondary)"
            mb={2}
            align="left"
          >
            Bạn có muốn thi công không?
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={hasOrder ? "yes" : "no"}
              onChange={(e) => setHasOrder(e.target.value === "yes")}
              name="hasOrderRadio"
            >
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label="Có thi công"
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label="Không thi công"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <Box mt={6} mb={2} display="flex" justifyContent="flex-start">
          <div style={{ width: "100%", maxWidth: 320 }}>
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
            >
              Xác nhận
            </Button>
          </div>
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
    </div>
  );
};

export default CustomDesign;
