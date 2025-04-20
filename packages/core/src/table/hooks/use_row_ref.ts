import React from "react";
import { VirtualRowContext } from "../contexts/virtual_row_context";
export const useRowRef = () => {
  const virtualRow = React.useContext(VirtualRowContext);
  if (!virtualRow) {
    throw new Error("useRow must be used within a RowContext.Provider");
  }
  return () => {
    return virtualRow();
  };
};
