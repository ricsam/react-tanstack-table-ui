import { Virtualizer } from "@tanstack/react-virtual";
import { VirtualRow } from "../types";

type DragState = {
  rowId: string;
  mouseStart: { x: number; y: number };
  itemPos: { x: number; y: number };
};

export type RowVirtualizerContextType = {
  rowVirtualizer: Virtualizer<any, any>;
  rows: VirtualRow[];
  offsetBottom: number;
  offsetTop: number;
  setIsDragging: (dragState: DragState) => void;
  moveResult: any;
  offsetLeft: number;
  offsetRight: number;
};


