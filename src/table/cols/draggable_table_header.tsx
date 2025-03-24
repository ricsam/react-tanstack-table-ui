import React, { CSSProperties } from "react";
import { PinPos } from "../rows/dnd/move_in_window";
import { Header } from "@tanstack/react-table";
import { useColContext } from "./col_context";

export type VirtualHeader = {
  isDragging: boolean;
  isPinned: PinPos;
  width: number;
  style: CSSProperties;
  children: React.ReactNode;
  canDrag: boolean;
  canPin: boolean;
  canResize: boolean;
  headerId: string;
  colIndex: number;
  start: number;
  header?: Header<any, any>;
};

export const DraggableTableHeader = ({
  headerId,
  isDragging,
  isPinned,
  width,
  canDrag,
  style,
  children,
  canPin,
  header,
  canResize,
}: VirtualHeader) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const ctx = useColContext();
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
        paddingRight: "8px",
        paddingLeft: "8px",
        overflow: "hidden",
        height: "32px",
        width,
        backgroundColor: isPinned ? "black" : "transparent",
        position: isPinned ? "sticky" : "relative",
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {children}
        <div style={{ width: "4px" }}></div>
      </div>
      {canDrag && (
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
      )}
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
          }}
        />
      )}
    </div>
  );
};
