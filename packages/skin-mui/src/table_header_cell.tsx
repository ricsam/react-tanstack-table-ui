import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import { Box, TableCell } from "@mui/material";
import { shallowEqual, useColProps, useColRef } from "@rttui/core";
import React from "react";

export const TableHeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasureInstance?: boolean;
      children: React.ReactNode;
    }
  >(({ isMeasureInstance, children }, ref) => {
    const { headerId, isPinned, width, canPin, canResize } = useColProps({
      callback: ({ header, vheader }) => {
        const state = vheader.state;
        const canPin = header?.column.getCanPin();
        const canResize = header?.column.getCanResize();
        return {
          headerId: vheader.header.id,
          isPinned: state.isPinned,
          width: state.width,
          canPin,
          canResize,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });

    const colRef = useColRef();

    return (
      <TableCell
        component="div"
        className="th"
        data-header-id={headerId}
        data-is-pinned={isPinned}
        ref={ref}
        style={{ width: isMeasureInstance ? "auto" : width }}
        sx={{
          transition: "background-color 0.2s ease",
          whiteSpace: "nowrap",
          zIndex: isPinned ? 1 : 0,
          display: "flex",
          overflow: "hidden",
          height: "var(--header-row-height)",
          position: "relative",
          flexShrink: 0,
          alignItems: "center",
          gap: "8px",
          justifyContent: "space-between",
          padding: "16px",
          boxSizing: "border-box",
          fontWeight: 600,
          backgroundColor: isPinned
            ? (theme) => theme.palette.background.paper
            : "transparent",
          borderRight: (theme) =>
            isPinned ? `1px solid ${theme.palette.divider}` : "none",
          "&:hover": {
            backgroundColor: (theme) => theme.palette.action.hover,
            borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
          },
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {children}
        </div>

        {canPin && (
          <div
            style={{
              display: "flex",
              gap: "4px",
              justifyContent: "flex-start",
            }}
          >
            {isPinned !== "start" ? (
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.5,
                }}
                onClick={() => {
                  colRef().column.pin("left");
                }}
              >
                <ChevronLeft fontSize="small" />
              </button>
            ) : null}
            {isPinned ? (
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.7,
                }}
                onClick={() => {
                  colRef().column.pin(false);
                }}
              >
                <Close fontSize="small" />
              </button>
            ) : null}
            {isPinned !== "end" ? (
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "2px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.5,
                }}
                onClick={() => {
                  colRef().column.pin("right");
                }}
              >
                <ChevronRight fontSize="small" />
              </button>
            ) : null}
          </div>
        )}

        {canResize && (
          <Box
            {...{
              onDoubleClick: () => colRef().column.resetSize(),
              onMouseDown: (ev: any) => colRef().header.getResizeHandler()(ev),
              onTouchStart: (ev: any) => colRef().header.getResizeHandler()(ev),
              className: `resizer ${
                colRef().header.column.getIsResizing() ? "isResizing" : ""
              }`,
              sx: {
                position: "absolute",
                top: 0,
                height: "100%",
                right: 0,
                width: "4px",
                cursor: "col-resize",
                userSelect: "none",
                touchAction: "none",
                opacity: 0,
                backgroundColor: (theme) => theme.palette.primary.main,
                transition: "opacity 0.2s",
                "&:hover, &.isResizing": {
                  opacity: 0.5,
                  width: "4px",
                },
              },
            }}
          />
        )}
      </TableCell>
    );
  }),
);
