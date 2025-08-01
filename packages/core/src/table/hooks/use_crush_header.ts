import { Header } from "@tanstack/react-table";
import { useMeasureContext } from "./use_measure_context";
import { useTableContext } from "../table_context";
import { getLeafHeaders } from "../../utils";
import { CrushBy } from "../types";

export const useCrushHeader = () => {
  const { measureCells } = useMeasureContext();
  const { tableRef } = useTableContext();
  return (
    header: Header<any, any>,
    crushBy: CrushBy | "default" = "default",
  ) => {
    measureCells({
      callback: ({ cols }) => {
        tableRef.current.tanstackTable.setColumnSizing((prev) => {
          const defaultCrushMinSizeBy = tableRef.current.uiProps.crushMinSizeBy;
          const newSizing = { ...prev };
          let crushMinSizeBy =
            header.column.columnDef.meta?.crushMinSizeBy ??
            defaultCrushMinSizeBy;

          if (crushBy !== "default") {
            crushMinSizeBy = crushBy;
          }

          let headerWidth: undefined | number;
          const headerSizing = cols.get(header.column.id);
          if (headerSizing) {
            headerWidth = Math.max(
              ...Object.values(headerSizing)
                .filter(({ type }) => {
                  if (crushMinSizeBy === "both") {
                    return true;
                  }
                  return type === crushMinSizeBy;
                })
                .map(({ width }) => width),
            );
          }

          let leafTotal = 0;
          const leafs = getLeafHeaders(header);
          leafs.forEach((h) => {
            const measuredCol = cols.get(h.id);
            if (!measuredCol) {
              return;
            }
            const size = Math.max(
              ...Object.values(measuredCol)
                .filter(({ type }) => {
                  if (crushMinSizeBy === "both") {
                    return true;
                  }
                  return type === crushMinSizeBy;
                })
                .map(({ width }) => width),
            );
            leafTotal += size;
            newSizing[h.column.id] = size;
          });
          //#region size by largest header
          // maybe add one more option to crushMinSizeBy to size by largest header, but for now it is enabled by default
          if (crushMinSizeBy !== "cell" && typeof headerWidth === "number") {
            if (leafTotal < headerWidth) {
              const diff = headerWidth - leafTotal;
              const perCol = diff / leafs.length;
              leafs.forEach((h) => {
                newSizing[h.column.id] = newSizing[h.column.id] + perCol;
              });
            }
          }
          //#endregion
          return newSizing;
        });
      },
      horizontalScrollOffset:
        tableRef.current.virtualData.body.colVirtualizer.scrollOffset ?? 0,
      verticalScrollOffset:
        tableRef.current.virtualData.body.rowVirtualizer.scrollOffset ?? 0,
      horizontalOverscan: 0,
      verticalOverscan: 0,
    });
  };
};
