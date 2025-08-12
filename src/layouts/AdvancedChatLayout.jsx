import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const AdvancedChatLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#0f172a",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AdvancedChatLayout;
