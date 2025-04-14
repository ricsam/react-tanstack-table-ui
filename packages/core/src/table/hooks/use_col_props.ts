import { Column, Header, Table } from "@tanstack/react-table";
import React from "react";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { VirtualHeaderCellContext } from "../contexts/virtual_header_cell_context";
import { VirtualHeaderCell } from "../types";
import { useTableProps } from "./use_table_props";

export const useColProps = <T>(
  callback: (props: {
    header: Header<any, any>;
    vheader: VirtualHeaderCell;
    table: Table<any>;
    column: Column<any, any>;
  }) => T,
  arePropsEqual?: (prev: T, next: T) => boolean,
): T => {
  const headerContext = React.useContext(VirtualHeaderCellContext);
  const cellContext = React.useContext(VirtualCellContext);

  if (!headerContext && !cellContext) {
    throw new Error("VirtualHeaderContext or VirtualCellContext not found");
  }

  return useTableProps((table) => {
    const vheader = headerContext ?? cellContext?.vheader;
    const header = vheader?.header;
    if (!header || !vheader) {
      throw new Error("VirtualHeaderContext or VirtualCellContext not found");
    }
    const headerInstance = header();
    return callback({
      header: headerInstance,
      vheader,
      table,
      column: headerInstance.column,
    });
  }, arePropsEqual);
};
