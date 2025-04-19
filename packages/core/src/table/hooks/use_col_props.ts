import { Column, Header } from "@tanstack/react-table";
import React from "react";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { VirtualHeaderCellContext } from "../contexts/virtual_header_cell_context";
import { RttuiHeader, RttuiTable } from "../types";
import { useTableProps, UseTablePropsOptions } from "./use_table_props";

export const useColProps = <T, U = RttuiTable>(
  options: Omit<UseTablePropsOptions<T, U>, "callback"> & {
    callback: (props: {
      header: Header<any, any>;
      vheader: RttuiHeader;
      selectorValue: U;
      column: Column<any, any>;
    }) => T;
  },
): T => {
  const headerContext = React.useContext(VirtualHeaderCellContext);
  const cellContext = React.useContext(VirtualCellContext);

  if (!headerContext && !cellContext) {
    if (!headerContext) {
      throw new Error("VirtualHeaderContext not found");
    }
    if (!cellContext) {
      throw new Error("VirtualCellContext not found");
    }
  }

  return useTableProps({
    ...options,
    callback: (selectorValue) => {
      const vheader: RttuiHeader | undefined =
        headerContext?.() ?? cellContext?.().header;
      const header: Header<any, any> | undefined = vheader?.header;
      if (!header || !vheader) {
        throw new Error("VirtualHeaderContext or VirtualCellContext not found");
      }

      return options.callback({
        header,
        vheader,
        selectorValue,
        column: header.column,
      });
    },
  });
};
