import { ColumnDef } from "@tanstack/react-table";

export const iterateOverColumns = (
  columns: ColumnDef<any, any>[],
): string[] => {
  return columns.flatMap((column): string[] => {
    if ("columns" in column && column.columns) {
      return iterateOverColumns(column.columns);
    }
    const id = column.id;
    if (!id) {
      throw new Error("All columns must have an id");
    }
    return [id];
  });
};
