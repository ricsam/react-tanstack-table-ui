import React from "react";
import { VirtualCell } from "../../rows/table_row";

export const VirtualCellContext = React.createContext<VirtualCell | undefined>(
  undefined,
);
export const useVirtualCell = (): VirtualCell | undefined => {
  const context = React.useContext(VirtualCellContext);

  return context;
};
