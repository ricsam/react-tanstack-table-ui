import React from "react";
import { VirtualHeader } from "./types";


export const VirtualHeaderContext = React.createContext<VirtualHeader | null>(
  null
);
export const useVirtualHeader = (): VirtualHeader => {
  const context = React.useContext(VirtualHeaderContext);
  if (!context) {
    throw new Error(
      "useVirtualHeader must be used within a VirtualHeaderContext"
    );
  }
  return context;
};
