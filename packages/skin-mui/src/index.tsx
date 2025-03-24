import {
  Box,
  Paper,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
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
        style={{
          overflow: "auto",
          width: width + "px",
          height: height + "px",
          position: "relative",
          contain: "paint",
          willChange: "transform",
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
          zIndex: 1,
          backgroundColor: (theme) => theme.palette.background.default,
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
          zIndex: 1,
          backgroundColor: (theme) => theme.palette.background.default,
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
          zIndex: 1,
          top: headerGroups.length * rowHeight,
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
          zIndex: 1,
          bottom: footerGroups.length * rowHeight - 1,
        }}
      >
        {children}
      </TableFooter>
    );
  },
  ExpandableTableRow: React.forwardRef(
    ({ children, isDragging, isPinned, flatIndex, dndStyle }, ref) => {
      const { table, rowHeight } = useTableContext();

      return (
        <TableRow
          component="div"
          className="table-row"
          sx={{
            position: "relative",
            opacity: isDragging ? 0.8 : 1,
            zIndex: isDragging ? 1 : 0,
            width: table.getTotalSize(),
            display: "flex",
            height: rowHeight,
            backgroundColor: isPinned
              ? (theme) => theme.palette.background.default
              : flatIndex % 2 === 0
                ? (theme) => theme.palette.background.default
                : (theme) => theme.palette.divider,
            ...dndStyle,
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
      <TableRow component="div" className="expanded-row" ref={ref}>
        <TableCell
          component="div"
          className="expanded-cell"
          colSpan={table.getAllLeafColumns().length}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  }),
  Cell: ({ children, header }) => {
    const { isDragging, isPinned } = header;
    const { rowHeight } = useTableContext();
    return (
      <TableCell
        className="drag-along-cell td"
        component="div"
        sx={{
          opacity: isDragging ? 0.8 : 1,
          height: rowHeight,
          width: header.width,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          zIndex: isDragging || isPinned ? 5 : 0,
          boxSizing: "border-box",
          alignItems: "center",
          gap: "4px",
          display: "flex",
          justifyContent: "flex-start",
          alignContent: "center",
          padding: "4px 8px",
          backgroundColor: isPinned
            ? (theme) => theme.palette.background.default
            : "transparent",
          flexShrink: 0,
          ...header.stickyStyle,
          ...header.dndStyle,
        }}
      >
        {children}
      </TableCell>
    );
  },
};

function TableHeaderCell({
  headerId,
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
  const { rowHeight } = useTableContext();
  const ref = React.useRef<HTMLDivElement>(null);
  const ctx = useColContext();
  return (
    <TableCell
      component="div"
      className="th"
      ref={ref}
      sx={{
        opacity: isDragging ? 0.8 : 1,
        transition: "none",
        whiteSpace: "nowrap",
        zIndex: isDragging || isPinned ? 1 : 0,
        display: "flex",
        overflow: "hidden",
        height: rowHeight,
        width,
        position: "relative",
        flexShrink: 0,
        alignItems: "center",
        gap: "4px",
        justifyContent: "flex-start",
        padding: "4px 8px",
        boxSizing: "border-box",
        backgroundColor: isPinned
          ? (theme) => theme.palette.background.default
          : "transparent",
        ...stickyStyle,
        ...dndStyle,
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
              width: "5px",
              background: "rgba(0, 0, 0, 0.5)",
              cursor: "col-resize",
              userSelect: "none",
              touchAction: "none",
              opacity: header.column.getIsResizing() ? 1 : 0.5,
              backgroundColor: header.column.getIsResizing()
                ? "blue"
                : "rgba(0, 0, 0, 1)",
            },
          }}
        />
      )}
    </TableCell>
  );
}

export { MuiSkin };
