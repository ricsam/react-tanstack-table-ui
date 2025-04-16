import { Table } from "@tanstack/react-table";
import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useTableProps, UseTablePropsOptions } from "./use_table_props";
import { VirtualRow } from "../types";
export const useRowProps = <T,>(
  callback: (row: VirtualRow, table: Table<any>) => T,
  options?: UseTablePropsOptions<T>,
) => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  return useTableProps((table) => {
    const result = callback(virtualRow, table);
    return result;
  }, options);
};
