import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { defaultSkin, ReactTanstackTableUi } from "@rttui/core";
import { AnoccaSkin } from "@rttui/skin-anocca";
import { MuiSkin } from "@rttui/skin-mui";
import React from "react";
import { DefaultThemeProvider } from "./default_theme_provider";
import { useBigTable } from "./use_big_table";
import { useHashState } from "./use_hash_state";
import { Table } from "@tanstack/react-table";

export function App() {
  const { table } = useBigTable();
  const [theme, setTheme] = useHashState<"light" | "dark">("theme", "light");
  const [skin, setSkin] = useHashState<"mui" | "anocca" | "default">(
    "skin",
    "mui",
  );

  const activeSkin = React.useMemo(() => {
    switch (skin) {
      case "mui":
        return MuiSkin;
      case "anocca":
        return AnoccaSkin;
      default:
        return defaultSkin;
    }
  }, [skin]);

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
        },
      }),
    [theme],
  );

  return (
    <DefaultThemeProvider theme={theme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "20px" }}>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark")}
              style={{ marginRight: "10px" }}
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>

            <select
              value={skin}
              onChange={(e) =>
                setSkin(e.target.value as "mui" | "anocca" | "default")
              }
            >
              <option value="mui">Material UI Skin</option>
              <option value="anocca">Anocca Skin</option>
              <option value="default">Default Skin</option>
            </select>
          </div>

          <ReactTanstackTableUi
            width={1920}
            height={1600}
            table={table as Table<any>}
            skin={activeSkin}
          />
        </div>
      </ThemeProvider>
    </DefaultThemeProvider>
  );
}
