import { createContext } from "react";
import { ThemeContextType } from "./theme_provider";

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);
