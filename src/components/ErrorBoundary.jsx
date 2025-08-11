import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Force a re-render by updating a key or state
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              maxWidth: '600px',
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Typography variant="h6" gutterBottom>
              Đã xảy ra lỗi trong component
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Component gặp sự cố không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Chi tiết lỗi (chỉ hiển thị trong môi trường development):
                </Typography>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    p: 1,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}
                >
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
          </Alert>
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            Thử lại
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
