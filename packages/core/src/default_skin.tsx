import React, { CSSProperties } from "react";
import { Skin, useTableCssVars } from "./skin";
import { VirtualHeader } from "./table/cols/draggable_table_header";
import { useTableContext } from "./table/table_context";

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
  TableHeaderRow: ({ children }) => {
    return (
      <div
        className="table-header-row"
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
  TableHeaderCell: HeaderCell,
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
  TableFooterRow: ({ children }) => {
    return (
      <div
        className="table-footer-row"
        style={{
          display: "flex",
          height: "var(--footer-row-height)",
          borderBottom: "1px solid var(--table-border-color)",
          boxSizing: "border-box",
          margin: 0,
        }}
      >
        {children}
      </div>
    );
  },
  TableFooterCell: HeaderCell,
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
    let style: CSSProperties = {
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
    ({ children, flatIndex, isDragging, isPinned, dndStyle }, ref) => {
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

function HeaderCell({
  isDragging,
  isPinned,
  width,
  canDrag,
  dndStyle,
  children,
  canPin,
  header,
  canResize,
  stickyStyle,
}: VirtualHeader) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      className="th"
      ref={ref}
      style={{
        opacity: isDragging ? 0.8 : 1,
        transition: "none",
        whiteSpace: "nowrap",
        zIndex: isDragging || isPinned ? 1 : 0,
        display: "flex",
        overflow: "hidden",
        width,
        backgroundColor: "var(--table-header-bg)",
        position: "relative",
        flexShrink: 0,
        paddingLeft: "8px",
        paddingRight: "8px",
        margin: 0,
        boxSizing: "border-box",
        borderRight: "1px solid var(--table-border-color)",
        fontWeight: "600",
        alignItems: "center",
        ...stickyStyle,
        ...dndStyle,
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        {children}
        <div style={{ width: "4px" }}></div>
      </div>
      {/* {canDrag && (
          <button
            onMouseDown={(ev: React.MouseEvent) => {
              const rect = ref.current?.getBoundingClientRect();
              if (!rect) {
                throw new Error("No rect");
              }
              ctx.onDragStart(headerId);
              ctx.setIsDragging({
                headerId: headerId,
                mouseStart: { x: ev.clientX, y: ev.clientY },
                itemPos: {
                  x: rect.left,
                  y: rect.top,
                },
              });
            }}
          >
            🟰
          </button>
        )} */}
      {canDrag && canPin && (
        <div className="flex gap-1 justify-center">
          {isPinned !== "start" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin("left");
              }}
            >
              {"<="}
            </button>
          ) : null}
          {isPinned ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin(false);
                // table.resetColumnSizing(true);
              }}
            >
              X
            </button>
          ) : null}
          {isPinned !== "end" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin("right");
              }}
            >
              {"=>"}
            </button>
          ) : null}
        </div>
      )}
      {canResize && header && (
        <div
          {...{
            onDoubleClick: () => header.column.resetSize(),
            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: `resizer ${
              header.column.getIsResizing() ? "isResizing" : ""
            }`,
            style: {
              position: "absolute",
              top: 0,
              height: "100%",
              right: 0,
              width: "5px",
              background: "var(--table-border-color)",
              cursor: "col-resize",
              userSelect: "none",
              touchAction: "none",
              opacity: header.column.getIsResizing() ? 1 : 0,
              backgroundColor: header.column.getIsResizing()
                ? "var(--table-border-color)"
                : "var(--table-border-color)",
            },
          }}
        />
      )}
    </div>
  );
}
