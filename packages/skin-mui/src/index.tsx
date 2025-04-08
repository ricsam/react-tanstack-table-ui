import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
import {
  Box,
  Paper,
  SxProps,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Theme,
} from "@mui/material";
import type { Skin, VirtualHeader } from "@rttui/core";
import { useTableContext, useTableCssVars } from "@rttui/core";
import { flexRender } from "@tanstack/react-table";
import React from "react";
const MuiSkin: Skin = {
  rowHeight: 52,
  headerRowHeight: 56,
  footerRowHeight: 52,
  OverlayContainer: ({ children }) => {
    const { width, height } = useTableContext();
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

    return (
      <Paper
        ref={tableContainerRef}
        className="outer-container"
        elevation={2}
        sx={{
          overflow: "auto",
          width: "var(--table-container-width)",
          height: "var(--table-container-height)",
          position: "relative",
          contain: "paint",
          willChange: "transform",
          borderRadius: 1,
        }}
      >
        {children}
      </Paper>
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
      <TableHead
        component="div"
        className="thead"
        sx={{
          position: "sticky",
          top: 0,
          width: "var(--table-width)",
          zIndex: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => `0 1px 0 ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableHead>
    );
  },
  TableFooter: ({ children }) => {
    return (
      <TableFooter
        component="div"
        className="table-footer"
        sx={{
          position: "sticky",
          bottom: -1,
          width: "var(--table-width)",
          zIndex: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => `0 -1px 0 ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableFooter>
    );
  },
  HeaderRow: ({ children }) => {
    return (
      <TableRow
        component="div"
        sx={{ height: "var(--row-height)", display: "flex" }}
      >
        {children}
      </TableRow>
    );
  },
  HeaderCell: React.forwardRef((props, ref) => {
    return <TableHeaderCell {...props} ref={ref} />;
  }),
  TableBody: ({ children }) => {
    return (
      <TableBody
        component="div"
        className="table-body"
        sx={{ position: "relative", width: "var(--table-width)" }}
      >
        {children}
      </TableBody>
    );
  },
  PinnedRows: ({ children, position, pinned }) => {
    if (pinned.length === 0) {
      return null;
    }

    const style: SxProps<Theme> = {
      position: "sticky",
      zIndex: 3,
    };
    if (position === "top") {
      style.top = "var(--header-height)";
      style.boxShadow = (theme: Theme) => `0 1px 0 ${theme.palette.divider}`;
    } else if (position === "bottom") {
      style.bottom = "var(--footer-height)";
      style.boxShadow = (theme: Theme) => `0 -1px 0 ${theme.palette.divider}`;
    }

    const Component = position === "top" ? TableHead : TableFooter;

    return (
      <Component
        component="div"
        className={`sticky-${position}-rows`}
        sx={style}
      >
        {children}
      </Component>
    );
  },
  PinnedCols: ({ children, position, pinned }) => {
    if (pinned.length === 0) {
      return null;
    }

    const style: SxProps<Theme> = {
      position: "sticky",
      zIndex: 3,
      display: "flex",
    };

    if (position === "left") {
      style.left = 0;
      style.boxShadow =
        "4px 0 8px -4px rgba(0, 0, 0, 0.15), 6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    } else if (position === "right") {
      style.right = 0;
      style.borderLeft = (theme: Theme) => `1px solid ${theme.palette.divider}`;
      style.boxShadow =
        "-4px 0 8px -4px rgba(0, 0, 0, 0.15), -6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    }

    return (
      <Box component="div" className={`sticky-${position}-cols`} sx={style}>
        {children}
      </Box>
    );
  },
  TableRowWrapper: React.forwardRef(
    ({ children, flatIndex, dndStyle }, ref) => {
      return (
        <Box
          sx={{
            ...dndStyle,
          }}
          data-index={flatIndex}
          ref={ref}
        >
          {children}
        </Box>
      );
    },
  ),
  TableRow: ({ children, isPinned, flatIndex }) => {
    return (
      <TableRow
        component="div"
        className="table-row"
        sx={{
          position: "relative",
          width: "var(--table-width)",
          display: "flex",
          height: "var(--row-height)",
          zIndex: 1,
          boxSizing: "border-box",
          backgroundColor: (theme) =>
            isPinned
              ? theme.palette.background.paper
              : flatIndex % 2 === 0
                ? theme.palette.background.paper
                : theme.palette.action.hover,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableRow>
    );
  },
  TableRowExpandedContent: ({ children }) => {
    const { table } = useTableContext();
    return (
      <TableRow
        component="div"
        className="expanded-row"
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <TableCell
          component="div"
          className="expanded-cell"
          colSpan={table.getAllLeafColumns().length}
          sx={{
            padding: 2,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  },
  Cell: React.forwardRef(({ children, header, isMeasuring }, ref) => {
    const { isPinned } = header;
    return (
      <TableCell
        className="td"
        component="div"
        ref={ref}
        sx={{
          height: "var(--row-height)",
          width: isMeasuring ? "auto" : header.width,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isPinned ? 5 : 0,
          boxSizing: "border-box",
          alignItems: "center",
          gap: "8px",
          display: "flex",
          justifyContent: "flex-start",
          alignContent: "center",
          padding: "16px",
          backgroundColor: isPinned
            ? (theme) => theme.palette.background.paper
            : "transparent",
          flexShrink: 0,
          borderRight: (theme) =>
            isPinned ? `1px solid ${theme.palette.divider}` : "none",
        }}
      >
        {children}
      </TableCell>
    );
  }),
};

const TableHeaderCell = React.forwardRef<
  HTMLDivElement,
  VirtualHeader & {
    type: "header" | "footer";
    isMeasuring?: boolean;
  }
>(({ headerId, isPinned, width, header, type, isMeasuring }, ref) => {
  const canPin = header?.column.getCanPin();
  const canResize = header?.column.getCanResize();

  return (
    <TableCell
      component="div"
      className="th"
      data-header-id={headerId}
      data-is-pinned={isPinned}
      ref={ref}
      sx={{
        transition: "background-color 0.2s ease",
        whiteSpace: "nowrap",
        zIndex: isPinned ? 1 : 0,
        display: "flex",
        overflow: "hidden",
        height: "var(--header-row-height)",
        width: isMeasuring ? "auto" : width,
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
        {header && !header.isPlaceholder
          ? flexRender(header.column.columnDef[type], header.getContext())
          : null}
      </div>

      {canPin && header && (
        <div
          style={{ display: "flex", gap: "4px", justifyContent: "flex-start" }}
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
                if (!header) {
                  return;
                }
                header.column.pin("left");
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
                if (!header) {
                  return;
                }
                header.column.pin(false);
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
                if (!header) {
                  return;
                }
                header.column.pin("right");
              }}
            >
              <ChevronRight fontSize="small" />
            </button>
          ) : null}
        </div>
      )}

      {canResize && header && (
        <Box
          {...{
            onDoubleClick: () => header.column.resetSize(),
            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: `resizer ${
              header.column.getIsResizing() ? "isResizing" : ""
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
});

export { MuiSkin };
