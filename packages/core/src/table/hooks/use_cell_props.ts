import { Table } from "@tanstack/react-table";
import React from "react";

import { VirtualCellContext } from "../contexts/VirtualCellContext";
import { VirtualCell } from "../types";
import { useTableProps } from "./useTableProps";

export const useCellProps = <T>(
  callback: (cell: VirtualCell, table: Table<any>) => T,
  arePropsEqual?: (prev: T, next: T) => boolean,
) => {
  const context = React.useContext(VirtualCellContext);
  if (!context) {
    throw new Error("useCell must be used within a VirtualCellContext");
  }
  return useTableProps((table) => {
    return callback(context, table);
  }, arePropsEqual);
};
