import { AutoSizer, ReactTanstackTableUi } from "@rttui/core";
import { BleuSkin, Resizer } from "@rttui/skin-bleu";
import { useTable } from "./use_table";
import { Box } from "@mui/material";
import { useInitializeSelectionManager } from "@ricsam/selection-manager";
import { useMemo } from "react";
import React from "react";

export function App() {
  const { table, setData } = useTable();
  const selectionManager = useInitializeSelectionManager({
    getNumRows: () => ({ type: "number", value: table.getRowCount() }),
    getNumCols: () => ({
      type: "number",
      value: table
        .getVisibleLeafColumns()
        .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader).length,
    }),
  });

  React.useEffect(() => {
    return selectionManager.listenToUpdateData((updates) => {
      setData((prev) => {
        const newData = [...prev];
        updates.forEach((update) => {
          const row = table.getRowModel().rows[update.rowIndex];
          const rowIndex = row.index;
          const col = table.getVisibleLeafColumns()[update.colIndex];
          const accessorKey = col.columnDef.meta?.accessorKey;
          const formatValue = col.columnDef.meta?.formatValue;
          const value = formatValue ? formatValue(update.value) : update.value;
          if (accessorKey) {
            newData[rowIndex] = { ...row.original, [accessorKey]: value };
          }
        });
        return newData;
      });
    });
  }, [selectionManager, setData, table]);

  const skin = useMemo(
    () => new BleuSkin(selectionManager),
    [selectionManager],
  );

  return (
    <AutoSizer
      style={{ flex: 1 }}
      adaptContainerToTable={{
        width: false,
        height: false,
      }}
      adaptTableToContainer={{
        width: true,
        height: true,
      }}
    >
      <ReactTanstackTableUi
        table={table}
        skin={skin}
        renderHeaderPlaceholder={() => {
          return <Resizer />;
        }}
        renderSubComponent={(row) => {
          return (
            <Box
              component="pre"
              sx={{
                fontSize: "10px",
                textAlign: "left",
                px: 1,
                py: 0,
              }}
            >
              <code>{JSON.stringify(row.original, null, 2)}</code>
            </Box>
          );
        }}
      />
    </AutoSizer>
  );
}
