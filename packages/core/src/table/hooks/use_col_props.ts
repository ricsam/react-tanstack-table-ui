import { Column, Header, Table } from "@tanstack/react-table";
import React from "react";
import { useTableProps } from "../../utils";
import { VirtualCellContext } from "../contexts/VirtualCellContext";
import { VirtualHeaderCellContext } from "../contexts/VirtualHeaderCellContext";
import { VirtualHeaderCell } from "../types";

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
