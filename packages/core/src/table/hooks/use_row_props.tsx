import { Row, Table } from "@tanstack/react-table";
import React from "react";
import { useTableProps } from "../../utils";
import { VirtualRowContext } from "../contexts/VirtualRowContext";

export const useRowProps = <T,>(
  callback: (row: Row<any>, table: Table<any>) => T,
) => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  return useTableProps((table) => {
    const result = callback(virtualRow.row(), table);
    return result;
  });
};
