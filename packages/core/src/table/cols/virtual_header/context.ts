import React from "react";
import { VirtualHeaderCell } from "./types";

export const VirtualHeaderContext = React.createContext<
  VirtualHeaderCell | undefined
>(undefined);
export const useVirtualHeader = (): VirtualHeaderCell | undefined => {
  const context = React.useContext(VirtualHeaderContext);

  return context;
};
