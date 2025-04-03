import { Header } from "@tanstack/react-table";
import { CSSProperties } from "react";
import { PinPos } from "../../types";

export type VirtualHeader = {
  type: "header" | "footer";
  isDragging: boolean;
  isPinned: PinPos;
  width: number;
  dndStyle: CSSProperties;
  columnId: string;
  headerId: string;
  headerIndex: number;
  header?: Header<any, any>;
  start: number;
  end: number;
};

export type HeaderIndex = {
  headerIndex: number;
  groupIndex: number;
  columnId: string;
  headerId: string;
  header: Header<any, unknown>;
};
