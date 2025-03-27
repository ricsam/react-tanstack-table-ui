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
  useTheme,
} from "@mui/material";
import {
  Skin,
  useTableContext,
  useTableCssVars,
  VirtualHeader,
} from "@rttui/core";
import React from "react";
import { flexRender } from "@tanstack/react-table";

const AnoccaSkin: Skin = {
  rowHeight: 32,
  headerRowHeight: 32,
  footerRowHeight: 32,
  OuterContainer: ({ children }) => {
    const { width, height, tableContainerRef } = useTableContext();
    const cssVars = useTableCssVars();

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
          ...cssVars,
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
  HeaderRow: TableHeaderRow,
  HeaderCell: (props) => {
    return <TableHeaderCell {...props} />;
  },
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
      style.borderBottom = (theme) => `1px solid ${theme.palette.divider}`;
      style.boxShadow =
        "0 4px 8px -4px rgba(0, 0, 0, 0.15), 0 6px 12px -6px rgba(0, 0, 0, 0.1)";
    } else if (position === "bottom") {
      style.bottom = "var(--footer-height)";
      style.borderTop = (theme) => `1px solid ${theme.palette.divider}`;
      style.boxShadow =
        "0 -4px 8px -4px rgba(0, 0, 0, 0.15), 0 -6px 12px -6px rgba(0, 0, 0, 0.1)";
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
  PinnedCols: ({ children, position, pinned, type }) => {
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
      style.borderLeft = (theme) => `1px solid ${theme.palette.divider}`;
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
      const theme = useTheme();
      const backgroundColor = (theme: Theme) => {
        const baseColor =
          flatIndex % 2 === 0
            ? theme.palette.background.paper
            : theme.palette.mode === "dark"
              ? theme.palette.grey[900]
              : theme.palette.grey[100];
        return baseColor;
      };

      const vars: Record<string, string> = {
        "--row-background-color": backgroundColor(theme),
      };

      return (
        <Box
          sx={{
            ...dndStyle,
            ...vars,
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
          backgroundColor: "var(--row-background-color)",
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
          }}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  },
  Cell: ({ children, header }) => {
    const { isPinned } = header;
    return (
      <TableCell
        className="td"
        component="div"
        sx={{
          height: "var(--row-height)",
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
          backgroundColor: "var(--row-background-color)",
          borderBottom: "none",
          flexShrink: 0,
          position: "relative",
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          ".table-row:hover &": {
            backgroundColor: (theme) => {
              // Always use solid background colors for all cells on hover
              return theme.palette.mode === "dark"
                ? "#1e1e52" // Dark blue solid color
                : "#E3F2FD"; // Light blue solid color
            },
            zIndex: isPinned ? 2 : 0,
          },
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
  header,
  type,
}: VirtualHeader & {
  type: "header" | "footer";
}) {
  return (
    <TableCell
      component="div"
      className="th"
      data-header-id={headerId}
      data-is-pinned={isPinned}
      sx={{
        transition: "background-color 0.2s ease",
        whiteSpace: "nowrap",
        zIndex: isPinned ? 1 : 0,
        display: "flex",
        overflow: "hidden",
        height: "var(--header-row-height)",
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
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
        {header && !header.isPlaceholder
          ? flexRender(header.column.columnDef[type], header.getContext())
          : null}
      </div>
    </TableCell>
  );
}

export { AnoccaSkin };

function TableHeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <TableRow
      component="div"
      sx={{ height: "var(--row-height)", display: "flex" }}
    >
      {children}
    </TableRow>
  );
}
