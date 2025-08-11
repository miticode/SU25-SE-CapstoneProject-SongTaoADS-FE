import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  AspectRatio as AspectRatioIcon,
  Tune as TuneIcon,
  MonetizationOn as MonetizationOnIcon,
  AutoFixHigh as AutoFixHighIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";

const FormulaGuide = ({ open, onClose, onNavigate }) => {
  const steps = [
    {
      label: "Quản lý kích thước",
      description: "Tạo mới kích thước hoặc sử dụng kích thước có sẵn",
      icon: <SettingsIcon color="primary" />,
      content: "Vào phần quản lý kích thước để tạo mới kích thước hoặc nếu đã có sẵn kích thước thì qua bước 2.",
      action: "Tạo/kiểm tra kích thước",
      page: "size-management", // Thêm thông tin trang
      buttonText: "Đi tới Quản lý kích thước",
    },
    {
      label: "Kích thước biển hiệu", 
      description: "Thêm kích thước vào biển hiệu",
      icon: <AspectRatioIcon color="primary" />,
      content: "Vào phần Kích thước biển hiệu để thêm kích thước đã tạo (có sẵn) vào biển hiệu.",
      action: "Gắn kích thước vào biển hiệu",
      page: "product-size", // Thêm thông tin trang
      buttonText: "Đi tới Kích thước biển hiệu",
    },
    {
      label: "Thuộc tính biển hiệu",
      description: "Tạo thuộc tính dựa trên kích thước", 
      icon: <TuneIcon color="primary" />,
      content: "Vào phần Thuộc tính biển hiệu để tạo thuộc tính mong muốn dựa trên kích thước.",
      action: "Tạo thuộc tính biển hiệu",
      page: "product-type-attribute", // Thêm thông tin trang
      buttonText: "Đi tới Thuộc tính biển hiệu",
    },
    {
      label: "Quản lý loại chi phí",
      description: "Tạo loại chi phí và công thức tự động cập nhật",
      icon: <MonetizationOnIcon color="primary" />,
      content: "Vào phần quản lý loại chi phí để tạo loại chi phí. Sau khi tạo xong loại chi phí thì công thức sẽ tự động cập nhật.",
      action: "Tạo loại chi phí",
      page: "cost-type-management", // Thêm thông tin trang
      buttonText: "Đi tới Quản lý loại chi phí",
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 24,
          p: 3,
          bgcolor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <AutoFixHighIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            Hướng dẫn tạo công thức tính toán
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, fontSize: "1rem", lineHeight: 1.6 }}
          >
            Để tạo công thức tính toán cho loại biển hiệu, vui lòng thực hiện theo 4 bước sau:
          </Typography>

          <Stepper orientation="vertical" sx={{ mt: 2 }}>
            {steps.map((step, index) => (
              <Step key={index} active={true} completed={false}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "primary.main",
                    },
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {index + 1}
                    </Box>
                  }
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      ml: 2,
                      bgcolor: "grey.50",
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 2,
                      position: "relative",
                    }}
                  >
                    <Box display="flex" alignItems="flex-start" gap={2}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: "white",
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "primary.light",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {step.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography
                          variant="subtitle2"
                          color="primary.main" 
                          fontWeight={600}
                          sx={{ mb: 0.5 }}
                        >
                          {step.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ lineHeight: 1.6, mb: 1.5 }}
                        >
                          {step.content}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 2,
                              py: 0.5,
                              bgcolor: "primary.main",
                              color: "white",
                              borderRadius: 1,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            {step.action}
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<LaunchIcon />}
                            onClick={() => {
                              onNavigate?.(step.page);
                              onClose();
                            }}
                            sx={{
                              textTransform: "none",
                              fontSize: "0.8rem",
                              fontWeight: 500,
                              borderRadius: 1.5,
                              px: 2,
                              py: 0.75,
                              minWidth: "auto",
                              bgcolor: "success.main",
                              "&:hover": {
                                bgcolor: "success.dark",
                              },
                            }}
                          >
                            {step.buttonText}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 3 }} />

          <Paper
            sx={{
              p: 2.5,
              bgcolor: "success.50",
              border: "1px solid",
              borderColor: "success.200",
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <AutoFixHighIcon color="success" />
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="success.main"
              >
                Lưu ý quan trọng
              </Typography>
            </Box>
            <Typography variant="body2" color="success.dark" sx={{ lineHeight: 1.6 }}>
              Sau khi hoàn thành bước 4 (tạo loại chi phí), công thức tính toán sẽ được tự động
              cập nhật và hiển thị trong bảng quản lý loại biển hiệu. Bạn có thể sử dụng các biến
              như <strong>#ĐƠN_GIÁ</strong>  trong công thức.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid",
          borderColor: "grey.200",
          bgcolor: "grey.50",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Đã hiểu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormulaGuide;
