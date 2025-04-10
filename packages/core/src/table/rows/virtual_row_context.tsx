import { Virtualizer } from "@tanstack/react-virtual";
import React from "react";
import { VirtualRow } from "./table_row";

type DragState = {
  rowId: string;
  mouseStart: { x: number; y: number };
  itemPos: { x: number; y: number };
};

export type VirtualRowContext = {
  rowVirtualizer: Virtualizer<any, any>;
  rows: VirtualRow[];
  offsetBottom: number;
  offsetTop: number;
  setIsDragging: (dragState: DragState) => void;
  moveResult: any;
  offsetLeft: number;
  offsetRight: number;
};

export const VirtualRowContext = React.createContext<
  VirtualRowContext | undefined
>(undefined);

export const useVirtualRowContext = () => {
  const context = React.useContext(VirtualRowContext);
  if (!context) {
    throw new Error(
      "useVirtualRowContext must be used within a VirtualRowProvider",
    );
  }
  return context;
};
