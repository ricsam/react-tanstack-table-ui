import { Table } from "@tanstack/react-table";

export const getTableColIndex = (
  spreadsheetColIndex: number,
  table: Table<any>,
) => {
  const rowHeaders = table
    .getVisibleLeafColumns()
    .filter((col) => col.columnDef.meta?.isSpreadsheetRowHeader)
    .map((col) => col.getIndex())
    .filter((index) => index > -1);

  let tableColIndex = spreadsheetColIndex;
  // spreadsheetColIndex = 0
  // rowHeaders = [0]


  // | TH | A | TH | B
  // | -- | 0 | -- | 1
  // | 0  | 1 | 2  | 3

  // spreadsheetColIndex = 1
  // rowHeaders = [0, 2]
  // 1. tableColIndex = 1
  // 2. tableColIndex = 2
  // 3. tableColIndex = 3


  for (const rowHeader of rowHeaders) {
    if (tableColIndex >= rowHeader) {
      tableColIndex++;
    }
  }
  return tableColIndex;
};
