import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useListenToTableUpdate } from "./use_listen_to_table_update";
import { RttuiRow } from "../types";
export const useRowRef = () => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  let initialVal: RttuiRow | undefined;
  try {
    initialVal = virtualRow();
  } catch (e) {
    // ignore
  }

  const rowRef = React.useRef(initialVal);
  rowRef.current = initialVal;

  useListenToTableUpdate(() => {
    try {
      rowRef.current = virtualRow();
    } catch (e) {
      // ignore
    }
  });
  return rowRef as React.RefObject<RttuiRow>;
};
