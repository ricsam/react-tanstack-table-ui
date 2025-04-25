import { ReactTanstackTableUi, lightModeVars, AutoSizer } from "@rttui/core";
import { useTable as useTable } from "./use_table";
import "./app.css";

export function App() {
  const { table } = useTable();

  return (
    <div style={{ width: "100vw", height: "100vh", ...lightModeVars }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "stretch",
          boxSizing: "border-box",
        }}
      >
        <AutoSizer
          style={{ flex: 1 }}
          adaptTableToContainer={{
            width: true,
            height: true,
          }}
        >
          <ReactTanstackTableUi
            table={table}
            renderSubComponent={(row) => {
              return (
                <pre style={{ fontSize: "10px", textAlign: "left" }}>
                  <code>{JSON.stringify(row.original, null, 2)}</code>
                </pre>
              );
            }}
          />
        </AutoSizer>
      </div>
    </div>
  );
}
