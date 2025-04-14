import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
import { useListenToTableUpdate } from "./use_listen_to_table_update";

export const useRowRef = () => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  const initialVal = virtualRow.row();
  const rowRef = React.useRef(initialVal);
  rowRef.current = initialVal;
  useListenToTableUpdate(() => {
    rowRef.current = virtualRow.row();
  });
  return rowRef;
};
