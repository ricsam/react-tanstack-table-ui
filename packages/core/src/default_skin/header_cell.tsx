import React from "react";
import { VirtualHeaderCell } from "../table/cols/virtual_header/types";
import { flexRender } from "@tanstack/react-table";
export const HeaderCell = React.forwardRef<
  HTMLDivElement,
  VirtualHeaderCell & {
    type: "header" | "footer";
    isMeasuring?: boolean;
  }
>(
  (
    {
      isDragging,
      isPinned,
      width,
      dndStyle,
      header,
      type,
      headerIndex,
      headerId,
      isMeasuring,
    },
    ref,
  ) => {
    const canDrag = header?.isPlaceholder ? false : true;
    const canPin = header?.column.getCanPin();
    const canResize = header?.column.getCanResize();
    return (
      <div
        className="th"
        ref={ref}
        data-header-index={headerIndex}
        data-header-id={headerId}
        style={{
          opacity: isDragging ? 0.8 : 1,
          transition: "none",
          whiteSpace: "nowrap",
          zIndex: isDragging || isPinned ? 1 : 0,
          display: "flex",
          overflow: "hidden",
          width: isMeasuring ? "auto" : width,
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
          ...dndStyle,
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {header && !header.isPlaceholder
            ? flexRender(header.column.columnDef[type], header.getContext())
            : null}
          <div style={{ width: "4px" }}></div>
        </div>
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
              className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`,
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
  },
);
