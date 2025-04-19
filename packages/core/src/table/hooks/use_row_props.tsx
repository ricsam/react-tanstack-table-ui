import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { RttuiRow, RttuiTable } from "../types";
import { useTableProps, UseTablePropsOptions } from "./use_table_props";

export const useRowProps = <T, U = RttuiTable>(
  options: Omit<UseTablePropsOptions<T, U>, "callback"> & {
    callback: (row: RttuiRow, table: U) => T;
  },
) => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  return useTableProps({
    ...options,
    callback: (table) => {
      const result = options.callback(virtualRow(), table);
      return result;
    },
  });
};
