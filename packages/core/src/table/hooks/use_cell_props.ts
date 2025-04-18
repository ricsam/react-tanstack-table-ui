import { Table } from "@tanstack/react-table";
import React from "react";

import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { VirtualCell } from "../types";
import { useTableProps, UseTablePropsOptions } from "./use_table_props";

export const useCellProps = <T>(
  callback: (cell: VirtualCell, table: Table<any>) => T,
  options?: UseTablePropsOptions<T>,
) => {
  const context = React.useContext(VirtualCellContext);
  if (!context) {
    throw new Error("useCell must be used within a VirtualCellContext");
  }
  return useTableProps((table) => {
    return callback(context, table);
  }, options);
};
