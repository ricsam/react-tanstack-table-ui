import { useTableProps } from "@rttui/core";

export const useSpreadsheetColIndex = (tableColIndex: number) => {
  const spreadsheetColIndex = useTableProps({
    callback(props) {
      const rowHeaders = props.tanstackTable
        .getVisibleLeafColumns()
        .filter(
          (col) =>
            col.columnDef.meta?.isSpreadsheetRowHeader && col.getIndex() > -1,
        )
        .map((col) => col.getIndex());
      let spreadsheetColIndex = tableColIndex;
      for (const rowHeader of rowHeaders) {
        if (tableColIndex === rowHeader) {
          return null;
        }
        if (tableColIndex > rowHeader) {
          spreadsheetColIndex--;
        }
      }
      return spreadsheetColIndex;
    },
    dependencies: [{ type: "tanstack_table" }],
  });
  return spreadsheetColIndex;
};
