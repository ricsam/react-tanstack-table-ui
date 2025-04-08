import React, { CSSProperties } from "react";
import { useTableContext } from "./table/table_context";
import { useColContext } from "./table/cols/col_context";
import { useVirtualRowContext } from "./table/rows/virtual_row_context";
import { VirtualHeader } from "./table/cols/virtual_header/types";
import { PinPos } from "./table/types";
import { VirtualRow } from "./table/rows/table_row";

export type Skin = {
  rowHeight: number;
  headerRowHeight: number;
  footerRowHeight: number;
  OuterContainer: React.FC<{ children: React.ReactNode }>;
  TableScroller: React.FC;

  HeaderCell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> &
      VirtualHeader & {
        isLastPinned: boolean;
        isFirstPinned: boolean;
        isLast: boolean;
        isFirst: boolean;
        isFirstCenter: boolean;
        isLastCenter: boolean;
        isMeasuring: boolean;
      }
  >;
  HeaderRow: React.FC<{ children: React.ReactNode; type: "header" | "footer" }>;

  TableHeader: React.FC<{ children: React.ReactNode }>;
  TableFooter: React.FC<{ children: React.ReactNode }>;

  TableBody: React.FC<{ children: React.ReactNode }>;

  PinnedRows: React.FC<{
    children: React.ReactNode;
    position: "top" | "bottom";
    pinned: VirtualRow[];
  }>;

  TableRowWrapper: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      children: React.ReactNode;
      flatIndex: number;
      isDragging: boolean;
      isPinned: PinPos;
      dndStyle: CSSProperties;
    }
  >;
  TableRow: React.FC<{
    children: React.ReactNode;
    isDragging: boolean;
    flatIndex: number;
    isPinned: PinPos;
  }>;
  TableRowExpandedContent: React.FC<{ children: React.ReactNode }>;

  PinnedCols: React.FC<{
    children: React.ReactNode;
    position: "left" | "right";
    pinned: VirtualHeader[];
    type: "header" | "footer" | "body";
  }>;

  Cell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      children: React.ReactNode;
      header: VirtualHeader;
      isMeasuring: boolean;
      isLastPinned: boolean;
      isFirstPinned: boolean;
      isLast: boolean;
      isFirst: boolean;
      isFirstCenter: boolean;
      isLastCenter: boolean;
    }
  >;

  PinnedColsOverlay?: React.FC<{ position: "left" | "right" }>;
  OverlayContainer: React.FC<{ children: React.ReactNode }>;
};

export function useTableCssVars(): Record<string, string> {
  const { table, skin, width, height, pinColsRelativeTo, pinRowsRelativeTo } =
    useTableContext();
  const { rowVirtualizer } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  return {
    "--table-container-width": width + "px",
    "--table-container-height": height + "px",
    "--row-height": skin.rowHeight + "px",
    "--header-row-height": skin.headerRowHeight + "px",
    "--footer-row-height": skin.footerRowHeight + "px",
    "--header-height": headerGroups.length * skin.headerRowHeight + "px",
    "--footer-height": footerGroups.length * skin.footerRowHeight + "px",
    "--table-width":
      pinColsRelativeTo === "table"
        ? `max(100%, ${table.getTotalSize()}px)`
        : table.getTotalSize() + "px",
    "--table-height":
      pinRowsRelativeTo === "table"
        ? `max(calc(100% - var(--header-height) - var(--footer-height)), ${rowVirtualizer.getTotalSize()}px)`
        : rowVirtualizer.getTotalSize() + "px",
  };
}
