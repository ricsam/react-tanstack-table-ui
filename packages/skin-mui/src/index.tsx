import {
  Box,
  Paper,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Theme,
  alpha,
} from "@mui/material";
import {
  Skin,
  useColContext,
  useRowContext,
  useTableContext,
  VirtualHeader,
} from "@rttui/core";
import React from "react";
const MuiSkin: Skin = {
  OuterContainer: ({ children }) => {
    const { width, height, tableContainerRef } = useTableContext();
    return (
      <Paper
        ref={tableContainerRef}
        className="outer-container"
        elevation={2}
        sx={{
          overflow: "auto",
          width: width + "px",
          height: height + "px",
          position: "relative",
          contain: "paint",
          willChange: "transform",
          borderRadius: 1,
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) =>
              alpha(theme.palette.text.secondary, 0.3),
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: (theme) =>
                alpha(theme.palette.text.secondary, 0.5),
            },
          },
        }}
      >
        {children}
      </Paper>
    );
  },
  TableScroller: () => {
    const { table, rowHeight } = useTableContext();
    const { rowVirtualizer } = useRowContext();
    const { footerGroups, headerGroups } = useColContext();
    return (
      <div
        className="table-scroller"
        style={{
          width: table.getTotalSize(),
          height:
            rowVirtualizer.getTotalSize() +
            footerGroups.length * rowHeight +
            headerGroups.length * rowHeight,
          position: "absolute",
        }}
      ></div>
    );
  },
  TableHeader: ({ children }) => {
    const { table } = useTableContext();
    return (
      <TableHead
        component="div"
        className="thead"
        sx={{
          position: "sticky",
          top: 0,
          width: table.getTotalSize(),
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
    const { table } = useTableContext();
    return (
      <TableFooter
        component="div"
        className="table-footer"
        sx={{
          position: "sticky",
          bottom: -1,
          width: table.getTotalSize(),
          zIndex: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
          boxShadow: (theme) => `0 -1px 0 ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableFooter>
    );
  },
  TableHeaderRow: ({ children }) => {
    const { rowHeight } = useTableContext();
    return (
      <TableRow component="div" sx={{ height: rowHeight, display: "flex" }}>
        {children}
      </TableRow>
    );
  },
  TableFooterRow: ({ children }) => {
    const { rowHeight } = useTableContext();
    return (
      <TableRow component="div" sx={{ height: rowHeight, display: "flex" }}>
        {children}
      </TableRow>
    );
  },
  TableHeaderCell: TableHeaderCell,
  TableFooterCell: TableHeaderCell,
  TableBody: ({ children }) => {
    const { table } = useTableContext();
    return (
      <TableBody
        component="div"
        className="table-body"
        sx={{ position: "relative", width: table.getTotalSize() }}
      >
        {children}
      </TableBody>
    );
  },
  StickyTopRows: ({ children }) => {
    const { rowHeight } = useTableContext();
    const { headerGroups } = useRowContext();
    return (
      <TableHead
        component="div"
        className="sticky-top-rows"
        sx={{
          position: "sticky",
          zIndex: 3,
          top: headerGroups.length * rowHeight,
          boxShadow: (theme) => `0 1px 0 ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableHead>
    );
  },
  StickyBottomRows: ({ children }) => {
    const { rowHeight } = useTableContext();
    const { footerGroups } = useRowContext();
    return (
      <TableFooter
        component="div"
        className="sticky-bottom-rows"
        sx={{
          position: "sticky",
          zIndex: 3,
          bottom: footerGroups.length * rowHeight - 1,
          boxShadow: (theme) => `0 -1px 0 ${theme.palette.divider}`,
        }}
      >
        {children}
      </TableFooter>
    );
  },
  ExpandableTableRow: React.forwardRef(
    ({ children, isPinned, flatIndex }, ref) => {
      const { table, rowHeight } = useTableContext();

      const backgroundColor = (theme: Theme) =>
        isPinned
          ? theme.palette.background.paper
          : flatIndex % 2 === 0
            ? theme.palette.background.paper
            : theme.palette.action.hover;

      return (
        <TableRow
          component="div"
          className="table-row"
          sx={{
            position: "relative",
            width: table.getTotalSize(),
            display: "flex",
            height: rowHeight,
            zIndex: 1,
            boxSizing: "border-box",
            backgroundColor,
            borderTop: (theme) => `1px solid ${backgroundColor(theme)}`,
            borderBottom: (theme) => `1px solid ${backgroundColor(theme)}`,
            "&:hover": {
              borderTop: (theme) => `1px solid ${theme.palette.primary.main}`,
              borderBottom: (theme) =>
                `1px solid ${theme.palette.primary.main}`,
            },
            transition: "all 0.1s ease",
          }}
          data-index={flatIndex}
          ref={ref}
        >
          {children}
        </TableRow>
      );
    },
  ),
  ExpandedRow: React.forwardRef(({ children }, ref) => {
    const { table } = useTableContext();
    return (
      <TableRow
        component="div"
        className="expanded-row"
        ref={ref}
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
  }),
  Cell: ({ children, header }) => {
    const { isPinned } = header;
    const { rowHeight } = useTableContext();
    return (
      <TableCell
        className="td"
        component="div"
        sx={{
          height: rowHeight,
          width: header.width,
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
          padding: "6px 12px",
          backgroundColor: isPinned
            ? (theme) => theme.palette.background.paper
            : "transparent",
          flexShrink: 0,
          borderRight: (theme) =>
            isPinned ? `1px solid ${theme.palette.divider}` : "none",
          ...header.stickyStyle,
        }}
      >
        {children}
      </TableCell>
    );
  },
};

function TableHeaderCell({
  headerId,
  isPinned,
  width,
  canPin,
  header,
  canResize,
  stickyStyle,
  children,
}: VirtualHeader) {
  const { rowHeight } = useTableContext();
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <TableCell
      component="div"
      className="th"
      ref={ref}
      sx={{
        transition: "background-color 0.2s ease",
        whiteSpace: "nowrap",
        zIndex: isPinned ? 1 : 0,
        display: "flex",
        overflow: "hidden",
        height: rowHeight,
        width,
        position: "relative",
        flexShrink: 0,
        alignItems: "center",
        gap: "8px",
        justifyContent: "space-between",
        padding: "6px 12px",
        boxSizing: "border-box",
        fontWeight: 600,
        backgroundColor: isPinned
          ? (theme) => theme.palette.background.paper
          : "transparent",
        borderRight: (theme) =>
          isPinned ? `1px solid ${theme.palette.divider}` : "none",
        "&:hover": {
          borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
        },
        ...stickyStyle,
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        {children}
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
                padding: "2px 4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.5,
                fontSize: "12px",
              }}
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin("left");
              }}
            >
              ◀
            </button>
          ) : null}
          {isPinned ? (
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.7,
                fontSize: "12px",
              }}
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin(false);
              }}
            >
              ✕
            </button>
          ) : null}
          {isPinned !== "end" ? (
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "2px 4px",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                opacity: 0.5,
                fontSize: "12px",
              }}
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin("right");
              }}
            >
              ▶
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
}

export { MuiSkin };
