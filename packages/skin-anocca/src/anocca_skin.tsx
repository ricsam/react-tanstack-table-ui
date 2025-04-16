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
  useCellProps,
  useColProps,
  useRowProps,
  useTableContext,
  useTableCssVars,
  useTableProps,
} from "@rttui/core";
import React, { CSSProperties } from "react";
import { TableHeaderRow } from "./table_header_row";

const AnoccaSkin: Skin = {
  rowHeight: 32,
  headerRowHeight: 32,
  footerRowHeight: 32,
  OverlayContainer: ({ children }) => {
    const { width, height } = useTableContext();
    const cssVars = useTableCssVars();
    return (
      <div
        className="rttui-overlay-container"
        style={{
          position: "relative",
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
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
        sx={{
          position: "relative",
          width: "var(--table-width)",
          height: "var(--table-height)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
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
  PinnedCols: ({ children, position }) => {
    const style: SxProps<Theme> = {
      position: "sticky",
      zIndex: 3,
      display: "flex",
    };

    if (position === "left") {
      style.left = 0;
    } else if (position === "right") {
      style.right = 0;
    }

    return (
      <Box component="div" className={`sticky-${position}-cols`} sx={style}>
        {children}
      </Box>
    );
  },

  TableRowWrapper: React.forwardRef(({ children }, ref) => {
    const theme = useTheme();
    const { flatIndex } = useRowProps((row) => {
      return { flatIndex: row.flatIndex };
    });
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
          ...vars,
          width: "var(--table-width)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "stretch",
        }}
        data-index={flatIndex}
        ref={ref}
      >
        {children}
      </Box>
    );
  }),
  TableRow: ({ children }) => {
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
          "&:hover": {
            backgroundColor: (theme) => {
              // Always use solid background colors for all cells on hover
              return theme.palette.mode === "dark"
                ? "#1e1e52" // Dark blue solid color
                : "#E3F2FD"; // Light blue solid color
            },
          },
        }}
      >
        {children}
      </TableRow>
    );
  },
  TableRowExpandedContent: ({ children }) => {
    const { leafColLength } = useTableProps((table) => {
      return { leafColLength: table.getAllLeafColumns().length };
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
          }}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  },
  Cell: React.memo(
    React.forwardRef(function Cell({ isMeasuring, children }, ref) {
      const {
        isPinned,
        isLastPinned,
        isLast,
        isLastCenter,
        width,
        isSomeColumnsPinnedRight,
      } = useCellProps((cell, table) => {
        const state = cell.vheader.getState();
        return {
          isPinned: state.isPinned,
          isLastPinned: state.isLastPinned,
          isLast: state.isLast,
          isLastCenter: state.isLastCenter,
          width: state.width,
          isSomeColumnsPinnedRight: table.getIsSomeColumnsPinned("right"),
        };
      });

      return (
        <TableCell
          className="td"
          component="div"
          ref={ref}
          style={{ width: isMeasuring ? "auto" : width }}
          sx={{
            height: "var(--row-height)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            zIndex: isPinned ? 5 : 0,
            boxSizing: "border-box",
            fontSize: "0.875rem",
            color: "text.primary",
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
            borderRight:
              ((isPinned === "start" && !isLastPinned) || !isPinned) &&
              !isLast &&
              !(isLastCenter && isSomeColumnsPinnedRight)
                ? (theme) => `1px solid ${theme.palette.divider}`
                : undefined,
            borderLeft:
              isPinned === "end" && !isLastPinned
                ? (theme) => `1px solid ${theme.palette.divider}`
                : undefined,
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
    }),
  ),
  PinnedColsOverlay: ({ position }) => {
    const width = useTableProps((table) => {
      if (!table.getIsSomeColumnsPinned(position)) {
        return undefined;
      }
      return position === "left"
        ? table.getLeftTotalSize()
        : table.getRightTotalSize();
    });

    if (width === undefined) {
      return null;
    }

    const style: CSSProperties = {
      width,
      [position]: 0,
      position: "sticky",
      top: 0,
      bottom: 0,
      zIndex: 20,
      pointerEvents: "none",
    };

    if (position === "left") {
      style.boxShadow =
        "4px 0 8px -4px rgba(0, 0, 0, 0.15), 6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    } else if (position === "right") {
      style.boxShadow =
        "-4px 0 8px -4px rgba(0, 0, 0, 0.15), -6px 0 12px -6px rgba(0, 0, 0, 0.1)";
    }
    return <div className={`pinned-${position}-overlay`} style={style} />;
  },
};

const TableHeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasuring: boolean;
      children: React.ReactNode;
    }
  >(({ isMeasuring, children }, ref) => {
    const {
      isSomeColumnsPinnedRight,
      headerId,
      isPinned,
      width,
      isLast,
      isLastPinned,
      isLastCenter,
    } = useColProps(({ vheader, table }) => {
      const state = vheader.getState();
      return {
        isSomeColumnsPinnedRight: table.getIsSomeColumnsPinned("right"),
        headerId: vheader.id,
        isPinned: state.isPinned,
        width: state.width,
        isLast: state.isLast,
        isLastPinned: state.isLastPinned,
        isLastCenter: state.isLastCenter,
      };
    });

    return (
      <TableCell
        ref={ref}
        component="div"
        className="th"
        data-header-id={headerId}
        data-is-pinned={isPinned}
        style={{ width: isMeasuring ? "auto" : width }}
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
          padding: "6px 12px",
          boxSizing: "border-box",
          fontWeight: 600,
          backgroundColor: isPinned
            ? (theme) => theme.palette.background.paper
            : "transparent",
          borderRight:
            ((isPinned === "start" && !isLastPinned) || !isPinned) &&
            !isLast &&
            !(isLastCenter && isSomeColumnsPinnedRight)
              ? (theme) => `1px solid ${theme.palette.divider}`
              : undefined,
          borderLeft:
            isPinned === "end" && !isLastPinned
              ? (theme) => `1px solid ${theme.palette.divider}`
              : undefined,
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {children}
        </div>
      </TableCell>
    );
  }),
);

export { AnoccaSkin };
