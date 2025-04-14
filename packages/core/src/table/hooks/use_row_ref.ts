import React from "react";
import { VirtualRowContext } from "../contexts/VirtualRowContext";
import { useListenToTableUpdate } from "./useListenToTableUpdate";

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
