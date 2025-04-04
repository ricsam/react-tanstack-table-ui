import { Header } from "@tanstack/react-table";
import { useTableContext } from "./table/table_context";

export const useMeasureHeader = () => {
  const { measureCells, table } = useTableContext();
  return (header: Header<any, any>) => {
    measureCells(({ cols }) => {
      table.setColumnSizing((prev) => {
        const newSizing = { ...prev };

        header.getLeafHeaders().forEach((leafHeader) => {
          const measuredCol = cols.get(leafHeader.column.id);
          if (!measuredCol) {
            return;
          }
          newSizing[leafHeader.column.id] = Math.max(
            ...measuredCol.map(({ rect }) => rect.width),
          );
        });
        return newSizing;
      });
    });
  };
};
