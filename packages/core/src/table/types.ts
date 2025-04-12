import {
  Cell,
  CellContext,
  Header,
  HeaderContext,
  HeaderGroup,
  Row,
} from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import { CSSProperties } from "react";
import { MeasuredCell } from "../measure_cell_context";

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  headers: () => Header<any, unknown>[];
  headerGroups: () => HeaderGroup<any>[];
};

export type CellRefs = Record<
  string,
  {
    width: number;
  } & MeasuredCell
>;

export type MeasureData = {
  cells: CellRefs;
  cols: Map<string, CellRefs | undefined>;
};

export type RttuiRef = {
  autoSizeColumns: () => void;
};

export type ShouldUpdate = {
  cell?: (
    prevContext: CellContext<any, any>,
    newContext: CellContext<any, any>,
  ) => boolean;
  header?: (
    prevContext: HeaderContext<any, any>,
    newContext: HeaderContext<any, any>,
  ) => boolean;
};

export type VirtualCell = {
  id: string;
  cell: () => Cell<any, any>;
  dndStyle: CSSProperties;
  vheader: VirtualHeaderCell;
};

export type VirtualRow = {
  id: string;
  dndStyle: CSSProperties;
  row: () => Row<any>;
  isDragging: boolean;
  isPinned: PinPos;
  flatIndex: number;
  cells: VirtualCell[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
};

export type VirtualHeaderCell = {
  id: string;
  type: "header" | "footer";
  isDragging: boolean;
  isPinned: PinPos;
  width: number;
  dndStyle: CSSProperties;
  columnId: string;
  headerIndex: number;
  header: () => Header<any, any>;
  start: number;
  end: number;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
};

export type VirtualHeaderGroup = {
  id: string;
  offsetLeft: number;
  offsetRight: number;
  headers: VirtualHeaderCell[];
};
