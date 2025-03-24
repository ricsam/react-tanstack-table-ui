import React from "react";
import { Virtualizer } from "../../lib/react-virtual";
import { VirtualHeaderGroup } from "../cols/header_group";
import { VirtualRow } from "./table_row";

export const RowContext = React.createContext<
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
      setIsDragging: (dragState: {
        rowId: string;
        mouseStart: { x: number; y: number };
        itemPos: { x: number; y: number };
      }) => void;
      moveResult: any;
    }
>(undefined);

export const useRowContext = () => {
  const context = React.useContext(RowContext);
  if (!context) {
    throw new Error("useRowContext must be used within a RowProvider");
  }
  return context;
};
