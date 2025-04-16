import React from "react";
import { useColProps } from "../table/hooks/use_col_props";
import { useColRef } from "../table/hooks/use_col_ref";
export const HeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasuring?: boolean;
      children: React.ReactNode;
    }
  >(({ isMeasuring, children }, ref) => {
    const {
      isPinned,
      width,
      headerId,
      canDrag,
      canPin,
      canResize,
      isResizing,
    } = useColProps(({ header, vheader, column }) => {
      const canDrag = header.isPlaceholder ? false : true;
      const canPin = header.column.getCanPin();
      const canResize = header?.column.getCanResize();
      const state = vheader.getState();

      return {
        canDrag,
        canPin,
        canResize,
        isResizing: column.getIsResizing(),
        isPinned: state.isPinned,
        width: state.width,
        headerId: vheader.id,
        isPlaceholder: header.isPlaceholder,
      };
    });
    const colRef = useColRef();
    return (
      <div
        className="th"
        ref={ref}
        data-header-id={headerId}
        style={{
          opacity: 1,
          transition: "none",
          whiteSpace: "nowrap",
          zIndex: isPinned ? 1 : 0,
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
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {children}
          <div style={{ width: "4px" }}></div>
        </div>
        {canDrag && canPin && (
          <div className="flex gap-1 justify-center">
            {isPinned !== "start" ? (
              <button
                className="border rounded px-2"
                onClick={() => {
                  colRef.current.column.pin("left");
                }}
              >
                {"<="}
              </button>
            ) : null}
            {isPinned ? (
              <button
                className="border rounded px-2"
                onClick={() => {
                  colRef.current.column.pin(false);
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
                  colRef.current.column.pin("right");
                }}
              >
                {"=>"}
              </button>
            ) : null}
          </div>
        )}
        {canResize && (
          <div
            {...{
              onDoubleClick: () => colRef.current.column.resetSize(),
              onMouseDown: (ev) => colRef.current.header.getResizeHandler()(ev),
              onTouchStart: (ev) =>
                colRef.current.header.getResizeHandler()(ev),
              className: `resizer ${colRef.current.column.getIsResizing() ? "isResizing" : ""}`,
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
                opacity: isResizing ? 1 : 0,
                backgroundColor: isResizing
                  ? "var(--table-border-color)"
                  : "var(--table-border-color)",
              },
            }}
          />
        )}
      </div>
    );
  }),
);
