import { Header } from "@tanstack/react-table";
import { CSSProperties } from "react";
import { PinPos } from "../../types";

export type VirtualHeaderCell = {
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
  isLastPinned: boolean;
  isFirstPinned: boolean;
  isLast: boolean;
  isFirst: boolean;
  isFirstCenter: boolean;
  isLastCenter: boolean;
};

export type HeaderIndex = {
  headerIndex: number;
  groupIndex: number;
  columnId: string;
  headerId: string;
  header: Header<any, unknown>;
};
