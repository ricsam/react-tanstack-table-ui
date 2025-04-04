import { Cell, Header, HeaderGroup } from "@tanstack/react-table";

export type PinPos = false | "start" | "end";
export type CombinedHeaderGroup = {
  id: string;
  headers: Header<any, unknown>[];
  headerGroups: HeaderGroup<any>[];
};

export type CellRefs = Record<
  string,
  { el: HTMLDivElement; cell: Cell<any, any>; rect: DOMRect }
>;

export type MeasureData = {
  cells: CellRefs;
  cols: Map<string, CellRefs[string][] | undefined>;
};
