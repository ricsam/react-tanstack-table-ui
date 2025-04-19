import React, { CSSProperties } from "react";
import { Skin, useTableCssVars } from "../skin";
import { useCellProps } from "../table/hooks/use_cell_props";
import { useTableContext } from "../table/table_context";
import { HeaderCell } from "./header_cell";
import { useRowProps } from "../table/hooks/use_row_props";
import { useTableProps } from "../table/hooks/use_table_props";
import { shallowEqual } from "../utils";

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
  OverlayContainer: ({ children }) => {
    const { width, height } = useTableProps({
      callback: (props) => {
        return {
          width: props.uiProps.width,
          height: props.uiProps.height,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "ui_props" }],
    });
    const cssVars = useTableCssVars();
    return (
      <div
        className="rttui-overlay-container"
        style={{
          position: "relative",
          overflow: "hidden",
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
    const { width, height } = useTableProps({
      callback: (props) => {
        return {
          width: props.uiProps.width,
          height: props.uiProps.height,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "ui_props" }],
    });

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
  HeaderCell: React.memo(
    React.forwardRef((props, ref) => {
      return <HeaderCell {...props} ref={ref} />;
    }),
  ),
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
  PinnedRows: ({ children, position }) => {
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
  PinnedCols: ({ children, position }) => {
    const style: CSSProperties = {
      position: "sticky",
      zIndex: 1,
      top: "var(--header-height)",
      display: "flex",
    };
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
  TableRowWrapper: React.forwardRef(({ children }, ref) => {
    const { rowIndex } = useRowProps({
      callback: (row) => {
        return {
          rowIndex: row.rowIndex,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });
    return (
      <div data-index={rowIndex} ref={ref}>
        {children}
      </div>
    );
  }),
  TableRow: ({ children }) => {
    const { relativeIndex, isPinned } = useRowProps({
      callback: (row) => {
        return {
          relativeIndex: row.relativeIndex,
          isPinned: row.row.getIsPinned(),
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });
    const style: CSSProperties = {
      position: "relative",
      zIndex: 0,
      width: "var(--table-width)",
      display: "flex",
      height: "var(--row-height)",
      margin: 0,
      borderBottom: "1px solid var(--table-border-color)",
      boxSizing: "border-box",
      backgroundColor: isPinned
        ? "var(--table-pinned-row-bg)"
        : relativeIndex % 2 === 0
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
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    );
  },
  Cell: React.memo(({ isMeasureInstance, children }) => {
    const { isPinned, width } = useCellProps({
      callback: (cell) => {
        const state = cell.state;
        return {
          isPinned: state.isPinned,
          width: state.width,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });
    return (
      <div
        className="drag-along-cell td"
        style={{
          width: isMeasureInstance ? "auto" : width,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isPinned ? 5 : 0,
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
        }}
      >
        {children}
      </div>
    );
  }),
};
