import { Virtualizer } from "@tanstack/react-virtual";
import { HorOffsets } from "../cols/col_virtualizer_type";
import { VirtualRow } from "../types";

type VerOffsets = {
  offsetTop: number;
  offsetBottom: number;
};

export type RowVirtualizerContextType = {
  rowVirtualizer: Virtualizer<any, any>;
  getRows: () => VirtualRow[];
  getHorizontalOffsets: () => HorOffsets;
  getVerticalOffsets: () => VerOffsets;
};
