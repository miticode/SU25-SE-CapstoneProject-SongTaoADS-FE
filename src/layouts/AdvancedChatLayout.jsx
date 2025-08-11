import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const AdvancedChatLayout = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#fafbfc",
        overflow: "hidden", // Prevent any overflow
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AdvancedChatLayout;
