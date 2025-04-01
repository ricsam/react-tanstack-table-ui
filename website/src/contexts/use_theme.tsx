import { useContext } from "react";
import { ThemeContextType } from "./theme_provider";
import { ThemeContext } from "./theme_context";

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
