import React from "react";
import { useTableContext } from "./table/table_context";
import { createTablePropsSelector, shallowEqual } from "./utils";

export interface Skin {
  rowHeight: number;
  headerRowHeight: number;
  footerRowHeight: number;
  ScrollContainer: React.FC<{ children: React.ReactNode }>; 
  TableScroller: React.FC;

  HeaderCell: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement> & {
      isMeasureInstance: boolean;
      children: React.ReactNode;
      type: "header" | "footer";
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

const cssVarsSelector = createTablePropsSelector((skin: Skin) => ({
  callback: (table) => {
    const { width, height } = table.uiProps;
    const totalSize = table.tanstackTable.getTotalSize();
    const rowTotalSize = table.virtualData.body.rowVirtualizer.getTotalSize();
    const headerOffsets: Record<string, string> = {};
    for (const type of ["header", "footer"] as const) {
      table.virtualData[type].groups.forEach((group) => {
        headerOffsets[`--${type}-${group.groupIndex}-offset-left`] =
          group.offsetLeft + "px";
        headerOffsets[`--${type}-${group.groupIndex}-offset-right`] =
          group.offsetRight + "px";
      });
    }
    return {
      "--table-container-width": width + "px",
      "--table-container-height": height + "px",
      "--row-height": skin.rowHeight + "px",
      "--header-row-height": skin.headerRowHeight + "px",
      "--footer-row-height": skin.footerRowHeight + "px",
      "--body-offset-left": table.virtualData.body.offsetLeft + "px",
      "--body-offset-right": table.virtualData.body.offsetRight + "px",
      "--body-offset-top": table.virtualData.body.offsetTop + "px",
      "--body-offset-bottom": table.virtualData.body.offsetBottom + "px",
      ...headerOffsets,
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
  dependencies: [
    { type: "ui_props" },
    { type: "tanstack_table" },
    {
      type: "col_offsets",
    },
    {
      type: "row_offsets",
    },
  ],
  areCallbackOutputEqual: shallowEqual,
}));

export function useTableCssVars(): Record<string, string> {
  const { skin } = useTableContext();

  return cssVarsSelector.useTableProps(skin);
}
