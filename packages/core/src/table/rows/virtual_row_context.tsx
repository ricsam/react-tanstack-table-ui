import React from "react";
import { Virtualizer } from "@tanstack/react-virtual";
import { VirtualHeaderGroup } from "../cols/header_group";
import { VirtualRow } from "./table_row";

type DragState = {
  rowId: string;
  mouseStart: { x: number; y: number };
  itemPos: { x: number; y: number };
};

export const VirtualRowContext = React.createContext<
  | undefined
  | {
      rowVirtualizer: Virtualizer<any, any>;
      rows: VirtualRow[];
      rowIds: string[];
      mainHeaderGroup: VirtualHeaderGroup;
      headerGroups: VirtualHeaderGroup[];
      footerGroups: VirtualHeaderGroup[];
      offsetBottom: number;
      offsetTop: number;
      getStart: (rowId: string) => number;
      setIsDragging: (dragState: DragState) => void;
      moveResult: any;
    }
>(undefined);

export const useVirtualRowContext = () => {
  const context = React.useContext(VirtualRowContext);
  if (!context) {
    throw new Error("useVirtualRowContext must be used within a VirtualRowProvider");
  }
  return context;
};
