import { createTheme, ThemeProvider } from "@mui/material";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { defaultSkin, ReactTanstackTableUi } from "@rttui/core";
import { AnoccaSkin } from "@rttui/skin-anocca";
import { MuiSkin } from "@rttui/skin-mui";
import {
  darkModeVars,
  lightModeVars,
  TailwindSkin,
} from "@rttui/skin-tailwind";
import { Table } from "@tanstack/react-table";
import React from "react";
import useMeasure from "react-use-measure";
import { DefaultThemeProvider } from "./default_theme_provider";
import { useBigTable } from "./use_big_table";
import { useHashState } from "./use_hash_state";

export function App() {
  const { table } = useBigTable();
  const [theme, setTheme] = useHashState<"light" | "dark">("theme", "light");
  const [skin, setSkin] = useHashState<
    "mui" | "anocca" | "default" | "tailwind"
  >("skin", "mui");
  const [ref, bounds] = useMeasure();

  const activeSkin = React.useMemo(() => {
    switch (skin) {
      case "mui":
        return MuiSkin;
      case "anocca":
        return AnoccaSkin;
      case "tailwind":
        return TailwindSkin;
      default:
        return defaultSkin;
    }
  }, [skin]);

  const Wrapper = React.useMemo(() => {
    let Wrapper: React.ComponentType<{
      children: React.ReactNode;
      theme: "light" | "dark";
    }> = React.Fragment;
    if (skin === "tailwind") {
      Wrapper = ({
        children,
        theme,
      }: {
        children: React.ReactNode;
        theme: "light" | "dark";
      }) => {
        let twStyle: Record<string, string> = {};
        if (skin === "tailwind") {
          if (theme === "light") {
            twStyle = lightModeVars;
          } else {
            twStyle = darkModeVars;
          }
        }
        return (
          <div style={twStyle} className={theme}>
            {children}
          </div>
        );
      };
    } else if (skin === "mui" || skin === "anocca") {
      Wrapper = ({
        children,
        theme,
      }: {
        children: React.ReactNode;
        theme: "light" | "dark";
      }) => {
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
          <ThemeProvider theme={muiTheme}>
            <ScopedCssBaseline>{children}</ScopedCssBaseline>
          </ThemeProvider>
        );
      };
    } else if (skin === "default") {
      Wrapper = ({
        children,
        theme,
      }: {
        children: React.ReactNode;
        theme: "light" | "dark";
      }) => (
        <DefaultThemeProvider theme={theme}>{children}</DefaultThemeProvider>
      );
    }
    return Wrapper;
  }, [skin]);

  React.useEffect(() => {
    document.body.classList.add(theme);
    return () => {
      document.body.classList.remove(theme);
    };
  }, [theme]);

  return (
    <div
      style={{
        textAlign: "center",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
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
            setSkin(e.target.value as "mui" | "anocca" | "default" | "tailwind")
          }
        >
          <option value="mui">Material UI Skin</option>
          <option value="anocca">Anocca Skin</option>
          <option value="tailwind">Tailwind Skin</option>
          <option value="default">Default Skin</option>
        </select>
      </div>
      <div style={{ position: "relative", flex: 1, width: "100%" }}>
        <div style={{ position: "absolute", inset: 0 }} ref={ref}>
          {bounds.width && bounds.height && (
            <Wrapper theme={theme}>
              <ReactTanstackTableUi
                width={bounds.width}
                height={bounds.height}
                table={table as Table<any>}
                skin={activeSkin}
                renderSubComponent={({ row }) => {
                  return (
                    <pre style={{ fontSize: "10px", textAlign: "left" }}>
                      <code>{JSON.stringify(row.original, null, 2)}</code>
                    </pre>
                  );
                }}
              />
            </Wrapper>
          )}
        </div>
      </div>
    </div>
  );
}
