import React from "react";
import { RowVirtualizerContext } from "../contexts/RowVirtualizerContext";

export const useRowVirtualizer = () => {
  const context = React.useContext(RowVirtualizerContext);
  if (!context) {
    throw new Error(
      "useVirtualRowContext must be used within a VirtualRowProvider",
    );
  }
  return context;
};
