import React, { CSSProperties } from "react";
import { useColVirtualizer } from "./table/hooks/use_col_virtualizer";
import { useRowVirtualizer } from "./table/hooks/use_row_virtualizer";
import { useTableContext } from "./table/table_context";
import { PinPos } from "./table/types";
import { useTableProps } from "./table/hooks/useTableProps";

export type Skin = {
  rowHeight: number;
  headerRowHeight: number;
  footerRowHeight: number;
  OuterContainer: React.FC<{ children: React.ReactNode }>;
  TableScroller: React.FC;

  HeaderCell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      isMeasuring: boolean;
      children: React.ReactNode;
    }
  >;
  HeaderRow: React.FC<{ children: React.ReactNode; type: "header" | "footer" }>;

  TableHeader: React.FC<{ children: React.ReactNode }>;
  TableFooter: React.FC<{ children: React.ReactNode }>;

  TableBody: React.FC<{ children: React.ReactNode }>;

  PinnedRows: React.FC<{
    children: React.ReactNode;
    position: "top" | "bottom";
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
    type: "header" | "footer" | "body";
  }>;

  Cell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      isMeasuring: boolean;
      children: React.ReactNode;
    }
  >;

  PinnedColsOverlay?: React.FC<{ position: "left" | "right" }>;
  OverlayContainer: React.FC<{ children: React.ReactNode }>;
};

export function useTableCssVars(): Record<string, string> {
  const { skin, width, height, pinColsRelativeTo, pinRowsRelativeTo } =
    useTableContext();
  const { rowVirtualizer } = useRowVirtualizer();
  const { footerGroups, headerGroups } = useColVirtualizer();

  const { totalSize } = useTableProps((table) => {
    const totalSize = table.getTotalSize();
    return { totalSize };
  });

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
        ? `max(100%, ${totalSize}px)`
        : totalSize + "px",
    "--table-height":
      pinRowsRelativeTo === "table"
        ? `max(calc(100% - var(--header-height) - var(--footer-height)), ${rowVirtualizer.getTotalSize()}px)`
        : rowVirtualizer.getTotalSize() + "px",
  };
}
