import React, { useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  Paper,
  Typography,
  Box,
  Grid,
  InputLabel,
  FormControl,
} from "@mui/material";

const steps = [
  "Thông tin doanh nghiệp",
  "Chọn loại biển hiệu",
  "Thông số kỹ thuật",
  "Tải lên thiết kế",
  "Xem trước & Xác nhận",
];

const productTypes = [
  { id: 1, name: "Biển hiệu truyền thống" },
  { id: 2, name: "Biển hiệu hiện đại" },
  { id: 3, name: "Biển hiệu đèn LED" },
  { id: 4, name: "Biển hiệu 3D" },
];

const CustomDesign = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [businessInfo, setBusinessInfo] = useState({
    companyName: "",
    address: "",
    contactInfo: "",
    logoUrl: "",
  });
  const [selectedType, setSelectedType] = useState("");
  const [specs, setSpecs] = useState({
    width: "",
    height: "",
    material: "",
    color: "",
  });
  const [designFile, setDesignFile] = useState(null);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  // UI cho từng bước
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" mb={2}>
              Thông tin doanh nghiệp
            </Typography>
            <TextField
              fullWidth
              label="Tên công ty"
              margin="normal"
              value={businessInfo.companyName}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  companyName: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              label="Địa chỉ"
              margin="normal"
              value={businessInfo.address}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, address: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="Liên hệ"
              margin="normal"
              value={businessInfo.contactInfo}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  contactInfo: e.target.value,
                })
              }
            />
            <TextField
              fullWidth
              label="Logo (URL)"
              margin="normal"
              value={businessInfo.logoUrl}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, logoUrl: e.target.value })
              }
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" mb={2}>
              Chọn loại biển hiệu
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Loại biển hiệu</InputLabel>
              <Select
                value={selectedType}
                label="Loại biển hiệu"
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {productTypes.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" mb={2}>
              Thông số kỹ thuật
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Chiều rộng (m)"
                  value={specs.width}
                  onChange={(e) =>
                    setSpecs({ ...specs, width: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Chiều cao (m)"
                  value={specs.height}
                  onChange={(e) =>
                    setSpecs({ ...specs, height: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Chất liệu"
                  value={specs.material}
                  onChange={(e) =>
                    setSpecs({ ...specs, material: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Màu sắc"
                  value={specs.color}
                  onChange={(e) =>
                    setSpecs({ ...specs, color: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" mb={2}>
              Tải lên thiết kế của bạn
            </Typography>
            <Button variant="contained" component="label">
              Chọn file thiết kế
              <input
                type="file"
                hidden
                onChange={(e) => setDesignFile(e.target.files[0])}
              />
            </Button>
            {designFile && (
              <Typography mt={2}>Đã chọn: {designFile.name}</Typography>
            )}
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" mb={2}>
              Xem trước & Xác nhận
            </Typography>
            <Typography>
              <b>Tên công ty:</b> {businessInfo.companyName}
            </Typography>
            <Typography>
              <b>Địa chỉ:</b> {businessInfo.address}
            </Typography>
            <Typography>
              <b>Liên hệ:</b> {businessInfo.contactInfo}
            </Typography>
            <Typography>
              <b>Logo:</b>{" "}
              {businessInfo.logoUrl && (
                <img
                  src={businessInfo.logoUrl}
                  alt="Logo"
                  style={{ maxHeight: 40 }}
                />
              )}
            </Typography>
            <Typography>
              <b>Loại biển hiệu:</b> {selectedType}
            </Typography>
            <Typography>
              <b>Kích thước:</b> {specs.width}m x {specs.height}m
            </Typography>
            <Typography>
              <b>Chất liệu:</b> {specs.material}
            </Typography>
            <Typography>
              <b>Màu sắc:</b> {specs.color}
            </Typography>
            <Typography>
              <b>File thiết kế:</b>{" "}
              {designFile ? designFile.name : "Chưa tải lên"}
            </Typography>
            <Button variant="contained" color="success" sx={{ mt: 2 }}>
              Xác nhận đặt hàng
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box maxWidth="md" mx="auto" mt={4} p={2}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={4}>{renderStep()}</Box>
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Quay lại
          </Button>
          {activeStep < steps.length - 1 && (
            <Button variant="contained" onClick={handleNext}>
              Tiếp tục
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default CustomDesign;
