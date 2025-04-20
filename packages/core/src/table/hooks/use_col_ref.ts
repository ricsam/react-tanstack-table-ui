import { Header } from "@tanstack/react-table";
import React from "react";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { VirtualHeaderCellContext } from "../contexts/virtual_header_cell_context";
import { RttuiHeader } from "../types";

export const useColRef = () => {
  const headerContext = React.useContext(VirtualHeaderCellContext);
  const cellContext = React.useContext(VirtualCellContext);

  const getVal = () => {
    const vheader: RttuiHeader | undefined =
      headerContext?.() ?? cellContext?.()?.header;
    const header: Header<any, any> | undefined = vheader?.header;
    if (!header || !vheader) {
      throw new Error("VirtualHeaderContext or VirtualCellContext not found");
    }
    const val = {
      header,
      vheader,
      column: header.column,
    };
    return val;
  };

  return getVal;
};
