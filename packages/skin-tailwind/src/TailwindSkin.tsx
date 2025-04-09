import {
  type Skin,
  useRow,
  useTableContext,
  useTableCssVars,
} from "@rttui/core";
import React, { CSSProperties } from "react";
import { TableHeaderCell } from "./TableHeaderCell";
import { clsx } from "./clsx";

export const TailwindSkin: Skin = {
  rowHeight: 36,
  headerRowHeight: 56,
  footerRowHeight: 56,
  OverlayContainer: ({ children }) => {
    const { width, height } = useTableContext();
    const cssVars = useTableCssVars();
    return (
      <div
        className="rttui-overlay-container relative overflow-hidden rounded-md shadow-md"
        style={{
          width: width + "px",
          height: height + "px",
          ...cssVars,
        }}
      >
        {children}
      </div>
    );
  },
  OuterContainer: ({ children }) => {
    const { tableContainerRef } = useTableContext();
    return (
      <div
        ref={tableContainerRef}
        className="outer-container relative overflow-auto"
        style={{
          width: "var(--table-container-width)",
          height: "var(--table-container-height)",
          contain: "paint",
          willChange: "transform",
          color: "var(--table-text-color)",
          backgroundColor: "var(--table-bg-color)",
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
        className="thead sticky top-0 z-10 bg-white dark:bg-gray-800"
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
        className="table-footer sticky bottom-[-1px] z-10"
        style={{
          width: "var(--table-width)",
          backgroundColor: "var(--table-header-bg)",
          borderTop: "1px solid var(--table-border-color)",
        }}
      >
        {children}
      </div>
    );
  },
  HeaderRow: ({ children }) => {
    return (
      <div
        className="flex border-b border-gray-200 dark:border-gray-700"
        style={{
          height: "var(--header-row-height)",
          boxSizing: "border-box",
        }}
      >
        <div className={clsx("absolute inset-y-0 left-0 w-0.5")} />
        {children}
      </div>
    );
  },
  HeaderCell: React.forwardRef((props, ref) => {
    return <TableHeaderCell {...props} ref={ref} />;
  }),
  TableBody: ({ children }) => {
    return (
      <div
        className="table-body relative flex flex-col items-stretch justify-start"
        style={{
          width: "var(--table-width)",
          backgroundColor: "var(--table-bg-color)",
          height: "var(--table-height)",
        }}
      >
        {children}
      </div>
    );
  },
  PinnedRows: ({ children, position, pinned }) => {
    if (pinned.length === 0) {
      return null;
    }

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
        className={`sticky-${position}-rows bg-white dark:bg-gray-800 sticky z-10`}
        style={style}
      >
        {children}
      </div>
    );
  },
  PinnedCols: ({ children, position, pinned, type }) => {
    if (pinned.length === 0) {
      return null;
    }

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
        className={
          type !== "body"
            ? `sticky-${position}-cols bg-white dark:bg-gray-800`
            : ""
        }
        style={style}
      >
        {children}
      </div>
    );
  },
  TableRowWrapper: React.forwardRef(
    ({ children, flatIndex, dndStyle }, ref) => {
      return (
        <div data-index={flatIndex} ref={ref} style={dndStyle}>
          {children}
        </div>
      );
    },
  ),
  TableRow: ({ children, flatIndex }) => {
    const vars: Record<string, string> = {
      "--table-cell-bg":
        flatIndex % 2 === 0 ? "var(--table-row-bg)" : "var(--table-row-alt-bg)",
    };

    return (
      <div
        className={clsx(
          `relative flex group/row bg-(--table-cell-bg) bg-[--table-cell-bg] hover:bg-[#E3F2FD] dark:hover:bg-[#1e1e52]`,
          "border-b border-gray-200 dark:border-gray-700",
        )}
        style={{
          width: "var(--table-width)",
          height: "var(--row-height)",
          boxSizing: "border-box",
          zIndex: 1,
          ...vars,
        }}
      >
        {children}
      </div>
    );
  },
  TableRowExpandedContent: ({ children }) => {
    return (
      <div
        className="expanded-row"
        style={{
          backgroundColor: "var(--table-row-bg)",
          borderBottom: "1px solid var(--table-border-color)",
        }}
      >
        {children}
      </div>
    );
  },
  Cell: React.forwardRef(
    (
      {
        children,
        header,
        isMeasuring,
        isLastPinned,
        isLast,
        isLastCenter,
        isFirst,
      },
      ref,
    ) => {
      const { isPinned } = header;
      const { row } = useRow();
      const selected = row.getIsSelected();
      const { table } = useTableContext();

      return (
        <div
          ref={ref}
          className={clsx(
            `td flex items-center px-2 py-2 overflow-hidden whitespace-nowrap text-ellipsis`,
            "bg-(--table-cell-bg) bg-[--table-cell-bg] group-hover/row:bg-[#E3F2FD] dark:group-hover/row:bg-[#1e1e52]",
            `relative border-b border-gray-200 dark:border-gray-700`,
          )}
          data-column-id={header.columnId}
          style={{
            height: "var(--row-height)",
            width: isMeasuring ? "auto" : header.width,
            zIndex: isPinned ? 5 : 0,
            boxSizing: "border-box",
            flexShrink: 0,
            borderRight:
              ((isPinned === "start" && !isLastPinned) || !isPinned) &&
              !isLast &&
              !(isLastCenter && table.getIsSomeColumnsPinned("right"))
                ? `1px solid var(--table-border-color)`
                : undefined,
            borderLeft:
              isPinned === "end" && !isLastPinned
                ? `1px solid var(--table-border-color)`
                : undefined,
          }}
        >
          {isFirst && selected && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-600" />
          )}
          {children}
        </div>
      );
    },
  ),
  PinnedColsOverlay: ({ position }) => {
    const { table } = useTableContext();
    if (!table.getIsSomeColumnsPinned(position)) {
      return null;
    }
    const width =
      position === "left"
        ? table.getLeftTotalSize()
        : table.getRightTotalSize();

    const style: CSSProperties = { width, [position]: 0 };

    if (position === "left") {
      style.boxShadow =
        "4px 0 8px -4px rgba(0, 0, 0, 0.15), 6px 0 12px -6px rgba(0, 0, 0, 0.1)";
      style.borderRight = "1px solid var(--table-border-color)";
    } else if (position === "right") {
      style.boxShadow =
        "-4px 0 8px -4px rgba(0, 0, 0, 0.15), -6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    }
    return (
      <div
        className={clsx(
          `pinned-${position}-overlay sticky top-0 bottom-0 z-20 pointer-events-none`,
        )}
        style={style}
      />
    );
  },
};
