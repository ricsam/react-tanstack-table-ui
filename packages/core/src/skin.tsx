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


  HeaderCell: React.FC<VirtualHeader>;
  HeaderRow: React.FC<{ children: React.ReactNode, type: "header" | "footer" }>;

  TableHeader: React.FC<{ children: React.ReactNode }>;
  TableFooter: React.FC<{ children: React.ReactNode }>;

  TableBody: React.FC<{ children: React.ReactNode }>;

  PinnedRows: React.FC<{ children: React.ReactNode, position: "top" | "bottom", pinned: VirtualRow[] }>;

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
    type: 'header' | 'footer' | 'body'
  }>;

  Cell: React.FC<{ children: React.ReactNode; header: VirtualHeader }>;
};

export function useTableCssVars(): Record<string, string> {
  const { table, skin } = useTableContext();
  const { rowVirtualizer } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  return {
    "--table-width": table.getTotalSize() + "px",
    "--table-height": rowVirtualizer.getTotalSize() + "px",
    "--row-height": skin.rowHeight + "px",
    "--header-row-height": skin.headerRowHeight + "px",
    "--footer-row-height": skin.footerRowHeight + "px",
    "--header-height": headerGroups.length * skin.headerRowHeight + "px",
    "--footer-height": footerGroups.length * skin.footerRowHeight + "px",
  };
}
