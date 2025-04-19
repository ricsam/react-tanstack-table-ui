import React from "react";
import { useTableProps } from "./table/hooks/use_table_props";
import { useTableContext } from "./table/table_context";
import { shallowEqual } from "./utils";

export type Skin = {
  rowHeight: number;
  headerRowHeight: number;
  footerRowHeight: number;
  OuterContainer: React.FC<{ children: React.ReactNode }>;
  TableScroller: React.FC;

  HeaderCell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      isMeasureInstance: boolean;
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
      relativeIndex: number;
    }
  >;
  TableRow: React.FC<{
    children: React.ReactNode;
    relativeIndex: number;
  }>;
  TableRowExpandedContent: React.FC<{ children: React.ReactNode }>;

  PinnedCols: React.FC<{
    children: React.ReactNode;
    position: "left" | "right";
    type: "header" | "footer" | "body";
  }>;

  Cell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      isMeasureInstance: boolean;
      children: React.ReactNode;
    }
  >;

  PinnedColsOverlay?: React.FC<{ position: "left" | "right" }>;
  OverlayContainer: React.FC<{ children: React.ReactNode }>;
};

export function useTableCssVars(): Record<string, string> {
  const { skin } = useTableContext();

  return useTableProps({
    callback: (table) => {
      const { width, height } = table.uiProps;
      const totalSize = table.tanstackTable.getTotalSize();
      const rowTotalSize = table.virtualData.body.virtualizer.getTotalSize();
      return {
        "--table-container-width": width + "px",
        "--table-container-height": height + "px",
        "--row-height": skin.rowHeight + "px",
        "--header-row-height": skin.headerRowHeight + "px",
        "--footer-row-height": skin.footerRowHeight + "px",
        "--header-height":
          table.virtualData.header.groups.length * skin.headerRowHeight + "px",
        "--footer-height":
          table.virtualData.footer.groups.length * skin.footerRowHeight + "px",
        "--table-width":
          table.uiProps.pinColsRelativeTo === "table"
            ? `max(100%, ${totalSize}px)`
            : totalSize + "px",
        "--table-height":
          table.uiProps.pinRowsRelativeTo === "table"
            ? `max(calc(100% - var(--header-height) - var(--footer-height)), ${rowTotalSize}px)`
            : rowTotalSize + "px",
      };
    },
    dependencies: [{ type: "ui_props" }, { type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
  });
}
