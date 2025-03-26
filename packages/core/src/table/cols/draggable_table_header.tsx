import { Header } from "@tanstack/react-table";
import React, { CSSProperties } from "react";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";

export type VirtualHeader = {
  isDragging: boolean;
  isPinned: PinPos;
  width: number;
  dndStyle: CSSProperties;
  stickyStyle: CSSProperties;
  children: React.ReactNode;
  canDrag: boolean;
  canPin: boolean;
  canResize: boolean;
  headerId: string;
  colIndex: number;
  start: number;
  header?: Header<any, any>;
};

export const VirtualHeaderContext = React.createContext<VirtualHeader | null>(
  null,
);
export const useVirtualHeader = (): VirtualHeader => {
  const context = React.useContext(VirtualHeaderContext);
  if (!context) {
    throw new Error(
      "useVirtualHeader must be used within a VirtualHeaderContext",
    );
  }
  return context;
};

export const DraggableTableHeader = (props: VirtualHeader) => {
  const { skin } = useTableContext();
  return (
    <VirtualHeaderContext.Provider value={props}>
      <skin.TableHeaderCell {...props} />
    </VirtualHeaderContext.Provider>
  );
};
