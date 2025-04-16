import {
  Cell,
  CellContext,
  Header,
  HeaderContext,
  Row,
} from "@tanstack/react-table";
import { Virtualizer } from "@tanstack/react-virtual";
import { MeasuredCell } from "../measure_cell_context";
import { HorOffsets } from "./cols/col_virtualizer_type";

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  headers: Header<any, unknown>[];
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
  vheader: VirtualHeaderCell;
};

export type VirtualRow = {
  id: string;
  row: () => Row<any>;
  isPinned: () => PinPos;
  flatIndex: number;
  getCells: () => VirtualCell[];
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
};

export type VirtualHeaderCell = {
  id: string;
  type: "header" | "footer";
  columnId: string;
  getIndex: () => number;
  header: () => Header<any, any>;
  getState: () => VirtualHeaderCellState;
};

export type VirtualHeaderCellState = {
  width: number;
  start: number;
  end: number;
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
  isPinned: PinPos;
};
export type VirtualHeaderGroup = {
  id: string;
  type: "header" | "footer";
  getHeaders: () => VirtualHeaderCell[];
  getOffsets: () => HorOffsets;
  getVirtualizer: () => Virtualizer<HTMLDivElement, Element>;
};
