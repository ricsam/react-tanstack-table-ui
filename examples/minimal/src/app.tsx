import { ReactTanstackTableUi, lightModeVars } from "@rttui/core";
import { useBigTable } from "./use_big_table";

export function App() {
  const { table } = useBigTable();

  return (
    <div style={{ textAlign: "center", ...lightModeVars }}>
      <ReactTanstackTableUi width={1920} height={1600} table={table} />
    </div>
  );
}
