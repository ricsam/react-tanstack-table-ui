import React from "react";
import { VirtualCellContext } from "../contexts/virtual_cell_context";
import { VirtualHeaderCellContext } from "../contexts/virtual_header_cell_context";
import { useListenToTableUpdate } from "./use_listen_to_table_update";
import { Header } from "@tanstack/react-table";
import { RttuiHeader } from "../types";

export const useColRef = () => {
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

  const getVal = () => {
    const vheader: RttuiHeader | undefined =
      headerContext?.() ?? cellContext?.().header;
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
  let initialVal: ReturnType<typeof getVal> | undefined;

  try {
    initialVal = getVal();
  } catch (e) {
    //
  }

  const ref = React.useRef(initialVal);
  ref.current = initialVal;

  useListenToTableUpdate(() => {
    try {
      ref.current = getVal();
    } catch (e) {
      //
    }
  });

  return ref as React.RefObject<Exclude<typeof initialVal, undefined>>;
};
