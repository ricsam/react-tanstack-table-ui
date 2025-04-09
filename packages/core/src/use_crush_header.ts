import { Header } from "@tanstack/react-table";
import { useTableContext } from "./table/table_context";
import { getSubHeaders } from "./utils";

export const useCrushHeader = () => {
  const {
    measureCells,
    table,
    crushMinSizeBy: defaultCrushMinSizeBy,
  } = useTableContext();
  return (header: Header<any, any>) => {
    measureCells(({ cols }) => {
      table.setColumnSizing((prev) => {
        const newSizing = { ...prev };
        const crushMinSizeBy =
          header.column.columnDef.meta?.crushMinSizeBy ?? defaultCrushMinSizeBy;

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
        const leafs = getSubHeaders(header);
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
    });
  };
};
