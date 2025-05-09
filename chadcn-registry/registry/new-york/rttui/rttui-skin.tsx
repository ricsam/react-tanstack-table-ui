import type { Skin  } from "@rttui/core";

import { cn } from "@/lib/utils";
import { Card } from "@/registry/new-york/ui/card";
import {
  shallowEqual,
  strictEqual,
  useCellProps,
  useColProps,
  useRowProps,
  useRowRef,
  useTableContext,
  useTableCssVars,
  useTableProps,
} from "@rttui/core";
import React, { CSSProperties } from "react";

const TableHeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasureInstance: boolean;
      children: React.ReactNode;
    }
  >(function TableHeaderCell({ isMeasureInstance, children }, ref) {
    const {
      isSomeColumnsPinnedRight,
      headerId,
      isPinned,
      width,
      isLast,
      isLastPinned,
      isLastCenter,
      columnId,
    } = useColProps({
      callback: ({ vheader, selectorValue }) => {
        const state = vheader.state;
        const headerId = vheader.header.id;
        const width = state.width;

        return {
          isSomeColumnsPinnedRight:
            selectorValue.tanstackTable.getIsSomeColumnsPinned("right"),
          headerId,
          isPinned: state.isPinned,
          width,
          isLast: state.isLast,
          isLastPinned: state.isLastPinned,
          isLastCenter: state.isLastCenter,
          columnId: vheader.header.column.id,
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: shallowEqual,
    });

    return (
      <div
        className={cn(
          "box-border shrink-0 th relative flex items-center px-2 py-3.5 text-sm font-semibold text-foreground overflow-hidden whitespace-nowrap bg-transparent hover:bg-accent",
          ((isPinned === "start" && !isLastPinned) || !isPinned) &&
            !isLast &&
            !(isLastCenter && isSomeColumnsPinnedRight)
            ? "border-r border-r-border"
            : undefined,
          isPinned === "end" && !isLastPinned
            ? "border-l border-l-border"
            : undefined,
        )}
        data-header-id={headerId}
        data-is-pinned={isPinned}
        data-column-id={columnId}
        ref={ref}
        style={{
          height: "var(--header-row-height)",
          width: isMeasureInstance ? "auto" : width,
          zIndex: isPinned ? 11 : 10,
        }}
      >
        <div className="flex-1 flex justify-start">{children}</div>
      </div>
    );
  }),
);

export const RttuiChadcnSkin: Skin = {
  rowHeight: 36,
  headerRowHeight: 56,
  footerRowHeight: 56,
  OverlayContainer: ({ children }) => {
    const { width, height } = useTableProps({
      selector: (props) => props.uiProps,
      callback: ({ width, height }) => {
        return {
          width,
          height,
        };
      },
      dependencies: [{ type: "ui_props" }],
      areCallbackOutputEqual: shallowEqual,
    });
    const cssVars = useTableCssVars();
    return (
      <Card
        className="rttui-overlay-container relative overflow-hidden rounded-md p-0"
        style={{
          width: width + "px",
          height: height + "px",
          ...cssVars,
        }}
      >
        {children}
      </Card>
    );
  },
  OuterContainer: ({ children }) => {
    const { tableContainerRef } = useTableContext();
    return (
      <div
        ref={tableContainerRef}
        className="outer-container relative overflow-auto text-foreground bg-background"
        style={{
          width: "var(--table-container-width)",
          height: "var(--table-container-height)",
          contain: "strict",
          willChange: "scroll-position",
        }}
      >
        {children}
      </div>
    );
  },
  TableScroller: () => {
    return (
      <div
        className="table-scroller absolute"
        style={{
          width: "var(--table-width)",
          height:
            "calc(var(--table-height) + var(--header-height) + var(--footer-height))",
        }}
      ></div>
    );
  },
  TableHeader: ({ children }) => {
    return (
      <div
        className="thead sticky top-0 z-10 bg-card"
        style={{
          width: "var(--table-width)",
        }}
      >
        {children}
      </div>
    );
  },
  TableFooter: ({ children }) => {
    return (
      <div
        className="table-footer sticky bottom-[-1px] z-10 bg-card border-t border-t-border"
        style={{
          width: "var(--table-width)",
        }}
      >
        {children}
      </div>
    );
  },
  HeaderRow: ({ children }) => {
    return (
      <div
        className="flex border-b border-b-border box-border"
        style={{
          height: "var(--header-row-height)",
          willChange: "contents",
        }}
      >
        <div className={cn("absolute inset-y-0 left-0 w-0.5")} />
        {children}
      </div>
    );
  },
  HeaderCell: TableHeaderCell,
  TableBody: ({ children }) => {
    return (
      <div
        className="table-body relative flex flex-col items-stretch justify-start bg-background"
        style={{
          width: "var(--table-width)",
          height: "var(--table-height)",
          willChange: "contents",
        }}
      >
        {children}
      </div>
    );
  },
  PinnedRows: ({ children, position }) => {
    const style: React.CSSProperties = {};

    if (position === "top") {
      style.top = "var(--header-height)";
      style.boxShadow =
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
    } else if (position === "bottom") {
      style.bottom = "var(--footer-height)";
      style.boxShadow =
        "0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06)";
    }

    return (
      <div
        className={`sticky-${position}-rows bg-card sticky z-10`}
        style={style}
      >
        {children}
      </div>
    );
  },
  PinnedCols: ({ children, position, type }) => {
    const style: React.CSSProperties = {
      position: "sticky",
      zIndex: 20,
      display: "flex",
    };

    if (position === "left") {
      style.left = 0;
    } else if (position === "right") {
      style.right = 0;
    }

    return (
      <div
        className={type !== "body" ? `sticky-${position}-cols bg-card` : ""}
        style={style}
      >
        {children}
      </div>
    );
  },
  TableRowWrapper: React.forwardRef(function TableRowWrapper(
    { children, relativeIndex: flatIndex },
    ref,
  ) {
    return (
      <div data-index={flatIndex} ref={ref}>
        {children}
      </div>
    );
  }),
  TableRow: ({ children, relativeIndex: flatIndex }) => {
    const { canSelect } = useRowProps({
      callback: (row) => {
        return {
          canSelect: row.row.getCanSelect(),
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: shallowEqual,
    });
    const rowRef = useRowRef();
    return (
      <div
        className={cn(
          "relative flex group/row box-border z-1",
          "border-b border-b-border",
          flatIndex % 2 === 0 ? "bg-background even" : "bg-muted odd",
          "hover:bg-[#E3F2FD] dark:hover:bg-[#3a473a]",
          canSelect && "cursor-pointer",
        )}
        onClick={
          !canSelect
            ? undefined
            : () => {
                rowRef()?.row.toggleSelected();
              }
        }
        style={{
          width: "var(--table-width)",
          height: "var(--row-height)",
          willChange: "contents",
        }}
      >
        {children}
      </div>
    );
  },
  TableRowExpandedContent: ({ children }) => {
    return (
      <div className="expanded-row bg-background border-b border-b-border">
        {children}
      </div>
    );
  },
  Cell: React.memo(
    React.forwardRef(function Cell({ isMeasureInstance, children }, ref) {
      const {
        isFirst,
        isPinned,
        isLastPinned,
        isLast,
        isLastCenter,
        width,
        columnId,
      } = useCellProps({
        callback: (cell) => {
          const state = cell.header.state;
          return {
            isFirst: state.isFirst,
            isPinned: state.isPinned,
            isLastPinned: state.isLastPinned,
            width: state.width,
            columnId: cell.header.header.column.id,
            isLast: state.isLast,
            isLastCenter: state.isLastCenter,
          };
        },
        areCallbackOutputEqual: shallowEqual,
        dependencies: [{ type: "tanstack_table" }],
      });

      const { selected, isSomeColumnsPinnedRight } = useRowProps({
        callback: (row, table) => {
          const selected = row.row.getIsSelected();
          return {
            selected,
            isSomeColumnsPinnedRight:
              table.tanstackTable.getIsSomeColumnsPinned("right"),
          };
        },
        areCallbackOutputEqual: shallowEqual,
        dependencies: [{ type: "tanstack_table" }],
      });

      return (
        <div
          ref={ref}
          className={cn(
            `td flex items-center px-2 py-2 overflow-hidden whitespace-nowrap text-ellipsis`,
            "[.even_&]:bg-background [.odd_&]:bg-muted",

            "[.even_&]:group-hover/row:bg-[#E3F2FD]",
            "[.odd_&]:group-hover/row:bg-[#E3F2FD]",

            "[.even_&]:dark:group-hover/row:bg-[#0e280e]",
            "[.odd_&]:dark:group-hover/row:bg-[#0e280e]",

            `relative border-b border-b-border`,
            ((isPinned === "start" && !isLastPinned) || !isPinned) &&
              !isLast &&
              !(isLastCenter && isSomeColumnsPinnedRight)
              ? `border-r border-r-border`
              : undefined,
            isPinned === "end" && !isLastPinned
              ? `border-l border-l-border`
              : undefined,
          )}
          data-column-id={columnId}
          style={{
            height: "var(--row-height)",
            width: isMeasureInstance ? "auto" : width,
            zIndex: isPinned ? 5 : 0,
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {isFirst && selected && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
          )}
          {children}
        </div>
      );
    }),
  ),
  PinnedColsOverlay: ({ position }) => {
    const width = useTableProps({
      callback: (table) => {
        const isPinned = table.tanstackTable.getIsSomeColumnsPinned(position);
        if (isPinned) {
          return position === "left"
            ? table.tanstackTable.getLeftTotalSize()
            : table.tanstackTable.getRightTotalSize();
        }
        return undefined;
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: strictEqual,
    });

    if (width === undefined) {
      return null;
    }

    const style: CSSProperties = { width, [position]: 0 };

    if (position === "left") {
      style.boxShadow =
        "4px 0 8px -4px rgba(0, 0, 0, 0.15), 6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    } else if (position === "right") {
      style.boxShadow =
        "-4px 0 8px -4px rgba(0, 0, 0, 0.15), -6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    }
    return (
      <div
        className={cn(
          `pinned-${position}-overlay sticky top-0 bottom-0 z-20 pointer-events-none`,
          position === "left" && "border-r border-r-border",
        )}
        style={style}
      />
    );
  },
};
