import { lightModeVars, darkModeVars } from "@rttui/core";
import React from "react";

export const DefaultThemeProvider: React.FC<ThemeProviderProps> = ({
  theme = "dark", children,
}) => {
  return (
    <div style={theme === "light" ? lightModeVars : darkModeVars}>
      {children}
    </div>
  );
};
interface ThemeProviderProps {
  theme?: "light" | "dark";
  children: React.ReactNode;
}
