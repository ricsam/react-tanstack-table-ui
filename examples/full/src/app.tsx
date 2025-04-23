import { defaultSkin, lightModeVars, ReactTanstackTableUi } from "@rttui/core";
import { MuiSkin } from "@rttui/skin-mui";
import { BleuSkin } from "@rttui/skin-bleu";
import React from "react";
import { defaultTableConfig, TableConfig } from "./table_config";
import { TableConfigPanel } from "./table_config_panel";
import { useConfigurableTable } from "./use_configurable_table";

export function App() {
  const [tableConfig, setTableConfig] =
    React.useState<TableConfig>(defaultTableConfig);
  const { table } = useConfigurableTable(tableConfig);

  // Determine which skin to use based on the config
  const activeSkin = React.useMemo(() => {
    switch (tableConfig.skin) {
      case "mui":
        return MuiSkin;
      case "bleu":
        return BleuSkin;
      default:
        return defaultSkin;
    }
  }, [tableConfig.skin]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        maxWidth: "1920px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", margin: "0 0 10px 0" }}>
          React Tanstack Table UI Demo
        </h1>
        <p style={{ fontSize: "18px", color: "#666", margin: "0" }}>
          Configure the table to explore different features and capabilities
        </p>
      </header>

      <TableConfigPanel config={tableConfig} onChange={setTableConfig} />

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
          ...lightModeVars,
        }}
      >
        <ReactTanstackTableUi
          width={1920}
          height={800}
          table={table as any}
          skin={activeSkin}
          renderSubComponent={({ row }) => {
            return (
              <pre style={{ fontSize: "10px", textAlign: "left" }}>
                <code>{JSON.stringify(row.original, null, 2)}</code>
              </pre>
            );
          }}
        />
      </div>

      <footer style={{ marginTop: "30px", fontSize: "14px", color: "#888" }}>
        <p>This demo showcases the flexibility of React Tanstack Table UI.</p>
      </footer>
    </div>
  );
}
