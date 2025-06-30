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
import type { Skin } from "@rttui/core";
import {
  shallowEqual,
  strictEqual,
  useCellProps,
  useRowProps,
  useTableContext,
  useTableCssVars,
  useTableProps,
} from "@rttui/core";
import React from "react";
import { TableHeaderCell } from "./table_header_cell";
const MuiSkin: Skin = {
  rowHeight: 52,
  headerRowHeight: 56,
  footerRowHeight: 52,
  OverlayContainer: ({ children }) => {
    const { width, height, hasFocus } = useTableProps({
      callback: (props) => {
        return {
          width: props.uiProps.width,
          height: props.uiProps.height,
          hasFocus: props.selection.tableHasFocus,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "ui_props" }, { type: "selection" }],
    });
    const cssVars = useTableCssVars();
    console.log('@focus', hasFocus)
    return (
      <div
        className="rttui-overlay-container"
        style={{
          position: "relative",
          overflow: "hidden",
          width: width + "px",
          height: height + "px",
          boxShadow: hasFocus ? "0 0 0 2px #2196f3" : "none",
          ...cssVars,
        }}
      >
        {children}
      </div>
    );
  },
  ScrollContainer: ({ children }) => {
    const { scrollContainerRef } = useTableContext();

    return (
      <Paper
        ref={scrollContainerRef}
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
  HeaderCell: React.memo(
    React.forwardRef((props, ref) => {
      return <TableHeaderCell {...props} ref={ref} />;
    }),
  ),
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
  PinnedRows: ({ children, position }) => {
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
  PinnedCols: ({ children, position }) => {
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
    ({ children, relativeIndex: flatIndex }, ref) => {
      return (
        <Box data-index={flatIndex} ref={ref}>
          {children}
        </Box>
      );
    },
  ),
  TableRow: ({ children, relativeIndex: flatIndex }) => {
    const { isPinned } = useRowProps({
      callback: (row) => {
        return {
          isPinned: row.row.getIsPinned(),
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });
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
    const leafColLength = useTableProps({
      callback: (table) => {
        return table.tanstackTable.getAllLeafColumns().length;
      },
      areCallbackOutputEqual: strictEqual,
      dependencies: [{ type: "tanstack_table" }],
    });

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
          colSpan={leafColLength}
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
  Cell: React.forwardRef(function Cell({ isMeasureInstance, children }, ref) {
    const { isPinned, width } = useCellProps({
      callback: (cell) => {
        const state = cell.header.state;
        return {
          isPinned: state.isPinned,
          width: state.width,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });
    return (
      <TableCell
        className="td"
        component="div"
        ref={ref}
        style={{ width: isMeasureInstance ? "auto" : width }}
        sx={{
          height: "var(--row-height)",
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

export { MuiSkin };
