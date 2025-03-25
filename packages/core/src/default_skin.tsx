import { Skin, useTableCssVars } from "./skin";
import React, { CSSProperties } from "react";
import { useTableContext } from "./table/table_context";
import { VirtualHeader } from "./table/cols/draggable_table_header";

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
          }}
        >
          {children}
        </div>
      );
    },
    StickyTopRows: ({ children }) => {
      return (
        <div
          className="sticky-top-rows"
          style={{
            position: "sticky",
            zIndex: 1,
            top: "var(--header-height)",
          }}
        >
          {children}
        </div>
      );
    },
    StickyBottomRows: ({ children }) => {
      return (
        <div
          className="sticky-bottom-rows"
          style={{
            position: "sticky",
            zIndex: 1,
            bottom: "var(--footer-height)",
          }}
        >
          {children}
        </div>
      );
    },
    ExpandableTableRow: React.forwardRef(
      ({ children, isDragging, isPinned, flatIndex, dndStyle }, ref) => {
        const { table } = useTableContext();
  
        const style: CSSProperties = {
          position: "relative",
          opacity: isDragging ? 0.8 : 1,
          zIndex: isDragging ? 1 : 0,
          width: table.getTotalSize(),
          display: "flex",
          height: "var(--row-height)",
          backgroundColor: isPinned
            ? "var(--table-pinned-row-bg)"
            : flatIndex % 2 === 0
              ? "var(--table-row-bg)"
              : "var(--table-row-alt-bg)",
          ...dndStyle,
        };
  
        return (
          <div
            className="table-row"
            style={style}
            data-index={flatIndex}
            ref={ref}
          >
            {children}
          </div>
        );
      },
    ),
    ExpandedRow: React.forwardRef(({ children }, ref) => {
      return (
        <div
          ref={ref}
          className="expanded-row"
          style={{ color: "black", fontFamily: "monospace" }}
        >
          {children}
        </div>
      );
    }),
    Cell: ({ children, header }) => {
      const { isDragging, isPinned } = header;
      return (
        <div
          className="drag-along-cell td"
          style={{
            opacity: isDragging ? 0.8 : 1,
            height: "var(--row-height)",
            width: header.width,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            zIndex: isDragging || isPinned ? 5 : 0,
            backgroundColor: isPinned ? "var(--table-pinned-cell-bg)" : "transparent",
            flexShrink: 0,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "4px",
            paddingLeft: "8px",
            border: "1px solid var(--table-border-color)",
            boxSizing: "border-box",
            paddingRight: "8px",
            ...header.stickyStyle,
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
          height: "32px",
          width,
          backgroundColor: "transparent",
          position: "relative",
          flexShrink: 0,
          paddingLeft: "8px",
          paddingRight: "8px",
          boxSizing: "border-box",
          border: "1px solid var(--table-border-color)",
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
                background: "rgba(0, 0, 0, 0.5)",
                cursor: "col-resize",
                userSelect: "none",
                touchAction: "none",
                opacity: header.column.getIsResizing() ? 1 : 0,
                backgroundColor: header.column.getIsResizing()
                  ? "blue"
                  : "rgba(0, 0, 0, 0.5)",
              },
            }}
          />
        )}
      </div>
    );
  }