import { Header } from "@tanstack/react-table";
import { CSSProperties } from "react";
import { PinPos } from "../../types";

export type VirtualHeader = {
  type: "header" | "footer";
  isDragging: boolean;
  isPinned: PinPos;
  width: number;
  dndStyle: CSSProperties;
  headerId: string;
  headerIndex: number;
  header?: Header<any, any>;
};
