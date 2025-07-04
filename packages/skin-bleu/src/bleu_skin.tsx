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
  shallowEqual,
  Skin,
  strictEqual,
  useCellProps,
  useColProps,
  useRowProps,
  useRowRef,
  useTableContext,
  useTableCssVars,
  useTableProps,
} from "@rttui/core";
import React, { CSSProperties } from "react";
import { TableHeaderRow } from "./table_header_row";

const BleuSkin: Skin = {
  rowHeight: 32,
  headerRowHeight: 32,
  footerRowHeight: 32,
  OverlayContainer: React.memo(function OverlayContainer({ children }) {
    const { width, height, hasFocus } = useTableProps({
      callback: (props) => {
        return {
          width: props.uiProps.width,
          height: props.uiProps.height,
          hasFocus: props.selection.tableHasFocus,
        };
      },
      dependencies: [{ type: "ui_props" }, { type: "selection" }],
      areCallbackOutputEqual: shallowEqual,
    });
    const cssVars = useTableCssVars();
    return (
      <Paper
        className="rttui-overlay-container"
        elevation={2}
        sx={{
          position: "relative",
          "*": {
            boxSizing: "border-box",
          },
          overflow: "hidden",
        }}
        style={{
          width: width + "px",
          height: height + "px",
          boxShadow: hasFocus ? "0 0 0 2px #2196f3" : "none",
          ...cssVars,
        }}
      >
        {children}
      </Paper>
    );
  }),
  ScrollContainer: ({ children }) => {
    const { scrollContainerRef } = useTableContext();

    return (
      <Box
        ref={scrollContainerRef}
        className="outer-container"
        sx={{
          overflow: "auto",
          width: "var(--table-container-width)",
          height: "var(--table-container-height)",
          position: "relative",
          contain: "strict",
          willChange: "scroll-position",
          borderRadius: 1,
        }}
      >
        {children}
      </Box>
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
          bottom: 0,
          width: "var(--table-width)",
          zIndex: 2,
          backgroundColor: (theme) => theme.palette.background.paper,
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
          willChange: "contents",
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
  PinnedCols: React.memo(({ children, position }) => {
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
  }),

  TableRowWrapper: React.memo(
    React.forwardRef(({ children }, ref) => {
      const theme = useTheme();
      const { relativeIndex, rowIndex } = useRowProps({
        callback: (row) => {
          return { relativeIndex: row.relativeIndex, rowIndex: row.rowIndex };
        },
        areCallbackOutputEqual: shallowEqual,
        dependencies: [{ type: "tanstack_table" }],
      });
      const backgroundColor = (theme: Theme) => {
        const baseColor =
          relativeIndex % 2 === 0
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
          data-index={rowIndex}
          ref={ref}
        >
          {children}
        </Box>
      );
    }),
  ),
  TableRow: React.memo(({ children }) => {
    const { canSelect } = useRowProps({
      callback: (row) => {
        return {
          canSelect: row.row.getCanSelect(),
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: shallowEqual,
    });
    const rowRef = useRowRef();
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
          willChange: "contents",
          "&:hover": {
            backgroundColor: (theme) => {
              // Always use solid background colors for all cells on hover
              return theme.palette.mode === "dark"
                ? "#1e1e52" // Dark blue solid color
                : "#E3F2FD"; // Light blue solid color
            },
          },
          cursor: canSelect ? "pointer" : "default",
        }}
        onClick={
          !canSelect
            ? undefined
            : () => {
                rowRef()?.row.toggleSelected();
              }
        }
      >
        {children}
      </TableRow>
    );
  }),
  TableRowExpandedContent: React.memo(({ children }) => {
    const { leafColLength } = useTableProps({
      callback: (table) => {
        return {
          leafColLength: table.tanstackTable.getAllLeafColumns().length,
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: strictEqual,
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
            p: 0,
          }}
        >
          {children}
        </TableCell>
      </TableRow>
    );
  }),
  Cell: React.memo(
    React.forwardRef(function Cell({ isMeasureInstance, children }, ref) {
      const {
        isPinned,
        isLastPinned,
        isLast,
        isLastCenter,
        width,
        isSomeColumnsPinnedRight,
        isSelected,
        selectionBorders,
        currentSelectionBorders,
      } = useCellProps({
        callback: (cell, table) => {
          const state = cell.header.state;
          const sc = {
            row: cell.rowIndex,
            col: cell.columnIndex,
          };
          const isSelected = table.selection.isSelected(sc);
          return {
            isPinned: state.isPinned,
            isLastPinned: state.isLastPinned,
            isLast: state.isLast,
            isLastCenter: state.isLastCenter,
            width: state.width,
            isSomeColumnsPinnedRight:
              table.tanstackTable.getIsSomeColumnsPinned("right"),
            isSelected,
            selectionBorders: table.selection.selectionBorders(sc),
            inNegativeSelection: table.selection.inNegativeSelection(sc),
            currentSelectionBorders:
              table.selection.currentSelectionBorders(sc),
          };
        },
        areCallbackOutputEqual: shallowEqual,
        dependencies: [{ type: "tanstack_table" }, { type: "selection" }],
      });

      const selectionShadows: string[] = [];
      selectionBorders.forEach((border) => {
        switch (border) {
          case "top":
            selectionShadows.push(`inset 0 2px 0 0 #2196F3`);
            break;
          case "right":
            selectionShadows.push(`inset -2px 0 0 0 #2196F3`);
            break;
          case "bottom":
            selectionShadows.push(`inset 0 -2px 0 0 #2196F3`);
            break;
          case "left":
            selectionShadows.push(`inset 2px 0 0 0 #2196F3`);
            break;
        }
      });

      currentSelectionBorders.forEach((border) => {
        switch (border) {
          case "top":
            selectionShadows.push(`inset 0 2px 0 0#c5b4b3`);
            break;
          case "right":
            selectionShadows.push(`inset -2px 0 0 0 #c5b4b3`);
            break;
          case "bottom":
            selectionShadows.push(`inset 0 -2px 0 0 #c5b4b3`);
            break;
          case "left":
            selectionShadows.push(`inset 2px 0 0 0 #c5b4b3`);
            break;
        }
      });

      const selectionBoxShadow =
        selectionShadows.length > 0 ? selectionShadows.join(", ") : undefined;

      return (
        <TableCell
          className="td"
          component="div"
          ref={ref}
          style={{ width: isMeasureInstance ? "auto" : width }}
          sx={[
            {
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

              borderBottom: "none",
              borderTop: "none",
              boxShadow: selectionBoxShadow,
            },
            !isSelected
              ? {
                  ".table-row:hover &": {
                    backgroundColor: (theme) => {
                      // Always use solid background colors for all cells on hover
                      return theme.palette.mode === "dark"
                        ? "#1e1e52" // Dark blue solid color
                        : "#E3F2FD"; // Light blue solid color
                    },
                    zIndex: isPinned ? 2 : 0,
                  },
                }
              : {
                  // backgroundColor: (theme) => theme.palette.primary.light,
                },
          ]}
        >
          {children}
        </TableCell>
      );
    }),
  ),
  PinnedColsOverlay: ({ position }) => {
    const width = useTableProps({
      callback: (table) => {
        if (!table.tanstackTable.getIsSomeColumnsPinned(position)) {
          return undefined;
        }
        return position === "left"
          ? table.tanstackTable.getLeftTotalSize()
          : table.tanstackTable.getRightTotalSize();
      },
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
      isMeasureInstance: boolean;
      children: React.ReactNode;
      type: "header" | "footer";
    }
  >(({ isMeasureInstance, children, type }, ref) => {
    const {
      isSomeColumnsPinnedRight,
      headerId,
      isPinned,
      width,
      isLast,
      isLastPinned,
      isLastCenter,
    } = useColProps({
      callback: ({ vheader, selectorValue }) => {
        const state = vheader.state;
        return {
          isSomeColumnsPinnedRight:
            selectorValue.tanstackTable.getIsSomeColumnsPinned("right"),
          headerId: vheader.header.id,
          isPinned: state.isPinned,
          width: state.width,
          isLast: state.isLast,
          isLastPinned: state.isLastPinned,
          isLastCenter: state.isLastCenter,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [{ type: "tanstack_table" }],
    });

    return (
      <TableCell
        ref={ref}
        component="div"
        className="th"
        data-header-id={headerId}
        data-is-pinned={isPinned}
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
          padding: 0,
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
          borderBottom: "none",
          borderTop: "none",
          [type === "header" ? "borderBottom" : "borderTop"]: (theme) =>
            `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-start",
            height: "100%",
            width: "100%",
            padding: "0 12px",
          }}
        >
          {children}
        </Box>
      </TableCell>
    );
  }),
);

export { BleuSkin };
