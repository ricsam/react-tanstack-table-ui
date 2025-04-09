import { Header, HeaderGroup } from "@tanstack/react-table";
import { MeasuredCell } from "../measure_cell_context";

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  headers: Header<any, unknown>[];
  headerGroups: HeaderGroup<any>[];
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
