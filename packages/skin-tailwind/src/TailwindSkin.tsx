import { type Skin, useTableContext, useTableCssVars } from "@rttui/core";
import React from "react";
import { TableHeaderCell } from "./TableHeaderCell";


export const TailwindSkin: Skin = {
  rowHeight: 36,
  headerRowHeight: 56,
  footerRowHeight: 36,
  OuterContainer: ({ children }) => {
    const { width, height, tableContainerRef } = useTableContext();
    const cssVars = useTableCssVars();

    return (
      <div
        ref={tableContainerRef}
        className="outer-container overflow-auto relative rounded-md shadow-md"
        style={{
          width: width + "px",
          height: height + "px",
          contain: "paint",
          willChange: "transform",
          color: "var(--table-text-color)",
          backgroundColor: "var(--table-bg-color)",
          ...cssVars,
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
          height: "calc(var(--table-height) + var(--header-height) + var(--footer-height))",
        }}
      ></div>
    );
  },
  TableHeader: ({ children }) => {
    return (
      <div
        className="thead sticky top-0 z-10 border-b border-gray-300 dark:border-gray-700 bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm backdrop-filter"
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
        className="flex divide-x divide-y divide-gray-200 dark:divide-gray-700"
        style={{
          height: "var(--header-row-height)",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    );
  },
  HeaderCell: (props) => {
    return <TableHeaderCell {...props} />;
  },
  TableBody: ({ children }) => {
    return (
      <div
        className="table-body relative divide-y divide-gray-200 dark:divide-gray-800"
        style={{
          width: "var(--table-width)",
          backgroundColor: "var(--table-bg-color)",
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

    const style: React.CSSProperties = {
      position: "sticky",
      zIndex: 3,
    };

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
        className={`sticky-${position}-rows bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm backdrop-filter`}
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
      style.boxShadow =
        "4px 0 6px -1px rgba(0, 0, 0, 0.1), 6px 0 4px -1px rgba(0, 0, 0, 0.06)";
    } else if (position === "right") {
      style.right = 0;
      style.borderLeft = "1px solid var(--table-border-color)";
      style.boxShadow =
        "-4px 0 6px -1px rgba(0, 0, 0, 0.1), -6px 0 4px -1px rgba(0, 0, 0, 0.06)";
    }

    return (
      <div
        className={type !== "body"
          ? `sticky-${position}-cols bg-white/75 dark:bg-gray-800/75 backdrop-blur-sm backdrop-filter`
          : ""}
        style={style}
      >
        {children}
      </div>
    );
  },
  TableRowWrapper: React.forwardRef(
    ({ children, flatIndex, dndStyle }, ref) => {
      return (
        <div data-index={flatIndex} ref={ref} style={dndStyle} className="flex">
          {children}
        </div>
      );
    }
  ),
  TableRow: ({ children, flatIndex }) => {
    const vars: Record<string, string> = {
      "--table-cell-bg": flatIndex % 2 === 0 ? "var(--table-row-bg)" : "var(--table-row-alt-bg)",
    };

    return (
      <div
        className="relative flex divide-x divide-gray-200 dark:divide-gray-700"
        style={{
          width: "var(--table-width)",
          height: "var(--row-height)",
          boxSizing: "border-box",
          zIndex: 1,
          backgroundColor: flatIndex % 2 === 0
            ? "var(--table-row-bg)"
            : "var(--table-row-alt-bg)",
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
        className="expanded-row p-4"
        style={{
          backgroundColor: "var(--table-row-bg)",
          borderBottom: "1px solid var(--table-border-color)",
        }}
      >
        {children}
      </div>
    );
  },
  Cell: ({ children, header }) => {
    const { isPinned } = header;
    return (
      <div
        className="td flex items-center px-2 py-2 overflow-hidden whitespace-nowrap text-ellipsis"
        style={{
          height: "var(--row-height)",
          width: header.width,
          zIndex: isPinned ? 5 : 0,
          boxSizing: "border-box",
          flexShrink: 0,
          backgroundColor: "var(--table-cell-bg)",
          borderRight: isPinned
            ? "1px solid var(--table-border-color)"
            : "none",
        }}
      >
        {children}
      </div>
    );
  },
};
