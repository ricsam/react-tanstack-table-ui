import { useTheme } from "./use-theme";

export const useThemeValue = () => {
  const { theme: currentTheme } = useTheme();
  let theme: "dark" | "light" = "dark";
  if (currentTheme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } else {
    theme = currentTheme;
  }
  return theme;
};
