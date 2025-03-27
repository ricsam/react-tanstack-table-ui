import React, { CSSProperties } from "react";
import { Skin, useTableCssVars } from "../skin";
import { useTableContext } from "../table/table_context";
import { HeaderCell } from "./header_cell";

export const darkModeVars: Record<string, string> = {
  "--table-text-color": "#ffffff",
  "--table-bg-color": "#121212",
  "--table-header-bg": "#000000",
  "--table-row-bg": "#000000",
  "--table-row-alt-bg": "#191919",
  "--table-pinned-row-bg": "#000000",
  "--table-pinned-cell-bg": "#000000",
  "--table-border-color": "#ffffff",
};

export const lightModeVars: Record<string, string> = {
  "--table-text-color": "#000000",
  "--table-bg-color": "#ffffff",
  "--table-header-bg": "#f0f0f0",
  "--table-row-bg": "#ffffff",
  "--table-row-alt-bg": "#f5f5f5",
  "--table-pinned-row-bg": "#f8f8f8",
  "--table-pinned-cell-bg": "#f8f8f8",
  "--table-border-color": "#d0d0d0",
};

export const defaultSkin: Skin = {
  rowHeight: 32,
  headerRowHeight: 32,
  footerRowHeight: 32,
  OuterContainer: ({ children }) => {
    const { width, height, tableContainerRef } = useTableContext();
    const cssVars = useTableCssVars();

    return (
      <div
        ref={tableContainerRef}
        className="outer-container"
        style={{
          overflow: "auto",
          width: width + "px",
          height: height + "px",
          position: "relative",
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
        className="table-scroller"
        style={{
          width: "var(--table-width)",
          height:
            "calc(var(--table-height) + var(--header-height) + var(--footer-height))",
          position: "absolute",
        }}
      ></div>
    );
  },
  TableHeader: ({ children }) => {
    return (
      <div
        className="thead"
        style={{
          position: "sticky",
          top: 0,
          background: "var(--table-header-bg)",
          width: "var(--table-width)",
          zIndex: 1,
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </div>
    );
  },
  HeaderRow: ({ children, type }) => {
    return (
      <div
        className={`table-${type}-row`}
        style={{
          display: "flex",
          height: "var(--header-row-height)",
          borderBottom: "1px solid var(--table-border-color)",
          boxSizing: "border-box",
          margin: 0,
        }}
      >
        {children}
      </div>
    );
  },
  HeaderCell: (props) => {
    return <HeaderCell {...props} />;
  },
  TableFooter: ({ children }) => {
    return (
      <div
        className="table-footer"
        style={{
          position: "sticky",
          bottom: -1,
          background: "var(--table-header-bg)",
          width: "var(--table-width)",
          zIndex: 1,
          margin: 0,
          padding: 0,
        }}
      >
        {children}
      </div>
    );
  },
  TableBody: ({ children }) => {
    return (
      <div
        className="table-body"
        style={{
          position: "relative",
          width: "var(--table-width)",
          margin: 0,
          padding: 0,
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
    const style: CSSProperties = {
      position: "sticky",
      zIndex: 1,
    };
    if (position === "top") {
      style.top = "var(--header-height)";
      style.borderBottom = "1px solid var(--table-border-color)";
      style.boxShadow =
        "0 4px 8px -4px rgba(0, 0, 0, 0.15), 0 6px 12px -6px rgba(0, 0, 0, 0.1)";
    }
    if (position === "bottom") {
      style.bottom = "var(--footer-height)";
      style.borderTop = "1px solid var(--table-border-color)";
      style.boxShadow =
        "0 -4px 8px -4px rgba(0, 0, 0, 0.15), 0 -6px 12px -6px rgba(0, 0, 0, 0.1)";
    }
    return (
      <div className={`sticky-${position}-rows`} style={style}>
        {children}
      </div>
    );
  },
  PinnedCols: ({ children, position, pinned }) => {
    const style: CSSProperties = {
      position: "sticky",
      zIndex: 1,
      top: "var(--header-height)",
      display: "flex",
    };
    if (pinned.length === 0) {
      return null;
    }
    if (position === "left") {
      style.left = 0;
      style.boxShadow =
        "4px 0 8px -4px rgba(0, 0, 0, 0.15), 6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    } else if (position === "right") {
      style.right = 0;
      style.borderLeft = "1px solid var(--table-border-color)";
      style.boxShadow =
        "-4px 0 8px -4px rgba(0, 0, 0, 0.15), -6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    }
    return (
      <div className={`sticky-cols-wrapper ${position}`} style={style}>
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
  TableRow: ({ children, isDragging, isPinned, flatIndex }) => {
    const { table } = useTableContext();

    const style: CSSProperties = {
      position: "relative",
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 1 : 0,
      width: table.getTotalSize(),
      display: "flex",
      height: "var(--row-height)",
      margin: 0,
      borderBottom: "1px solid var(--table-border-color)",
      boxSizing: "border-box",
      backgroundColor: isPinned
        ? "var(--table-pinned-row-bg)"
        : flatIndex % 2 === 0
          ? "var(--table-row-bg)"
          : "var(--table-row-alt-bg)",
    };

    return (
      <div className="table-row" style={style}>
        {children}
      </div>
    );
  },
  TableRowExpandedContent: ({ children }) => {
    return (
      <div
        className="expanded-row"
        style={{
          color: "black",
          fontFamily: "monospace",
          margin: 0,
          border: "1px solid var(--table-border-color)",
          borderTop: 0,
          backgroundColor: "var(--table-row-bg)",
        }}
      >
        {children}
      </div>
    );
  },
  Cell: ({ children, header }) => {
    const { isDragging, isPinned } = header;
    return (
      <div
        className="drag-along-cell td"
        style={{
          opacity: isDragging ? 0.8 : 1,
          width: header.width,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isDragging || isPinned ? 5 : 0,
          backgroundColor: "var(--table-pinned-cell-bg)",
          borderRight: "1px solid var(--table-border-color)",
          boxSizing: "border-box",
          flexShrink: 0,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          gap: "4px",
          paddingLeft: "8px",
          margin: 0,
          borderTop: 0,
          paddingRight: "8px",
          //   ...header.stickyStyle,
          ...header.dndStyle,
        }}
      >
        {children}
      </div>
    );
  },
};
