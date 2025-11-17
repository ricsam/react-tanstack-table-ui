import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "./app.css";
import { Box } from "@mui/material";

const theme = createTheme({
  palette: {
    mode:
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : "light",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
          inset: 0,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            padding: "16px",
            display: "flex",
            boxSizing: "border-box",
          }}
        >
          <App />
        </Box>
      </Box>
    </ThemeProvider>
  </StrictMode>,
);
