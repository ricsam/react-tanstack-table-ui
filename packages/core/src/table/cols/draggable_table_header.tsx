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

export const DraggableTableHeader = (props: VirtualHeader) => {
  const { skin } = useTableContext();
  return <skin.TableHeaderCell {...props} />;
};
