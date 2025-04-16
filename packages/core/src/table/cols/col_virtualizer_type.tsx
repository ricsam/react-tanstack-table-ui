import { VirtualHeaderGroup } from "../types";

export type HorOffsets = {
  offsetLeft: number;
  offsetRight: number;
};

export type ColVirtualizerType = {
  getFooterGroups: () => VirtualHeaderGroup[];
  getHeaderGroups: () => VirtualHeaderGroup[];
  getMainHeaderGroup: () => VirtualHeaderGroup;
  getMainHeaderIndices: () => Record<string, number>;
};
