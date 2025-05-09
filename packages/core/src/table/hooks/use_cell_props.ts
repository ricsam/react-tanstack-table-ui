import React from "react";

import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { RttuiCell, RttuiTable } from "../types";
import { useTableProps, UseTablePropsOptions } from "./use_table_props";

export const useCellProps = <T, U = RttuiTable>(
  options: Omit<UseTablePropsOptions<T, U>, "callback"> & {
    callback: (cell: RttuiCell, selectorValue: U) => T;
  },
) => {
  const context = React.useContext(VirtualCellContext);
  if (!context) {
    throw new Error("useCell must be used within a VirtualCellContext");
  }
  return useTableProps({
    ...options,
    shouldUnmount: () => {
      return !context();
    },
    callback: (selectorValue) => {
      const cell = context();
      if (!cell) {
        throw new Error("Cell not found");
      }
      return options.callback(cell, selectorValue);
    },
  });
};
