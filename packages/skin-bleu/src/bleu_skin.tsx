import {
  Box,
  Input,
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
  SelectionManager,
  useSelectionManager,
  writeToClipboard,
} from "@ricsam/selection-manager";
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
import { RowData } from "@tanstack/react-table";
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { SelectionManagerProvider } from "./selection_manager_context";
import { TableHeaderRow } from "./table_header_row";
import { useSpreadsheetColIndex } from "./use_spreadsheet_col_index";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    disablePadding?: boolean;
    isSpreadsheetRowHeader?: boolean;
    renderInput?: (
      value: TValue,
      selectionManager: SelectionManager,
      cell: { row: number; col: number },
    ) => React.ReactNode;
    valueToString?: (value: TValue) => string;
    index?: number;
  }
}

export class BleuSkin implements Skin {
  rowHeight = 32;
  headerRowHeight = 32;
  footerRowHeight = 32;

  constructor(private readonly selectionManager: SelectionManager) {}

  OverlayContainer = React.memo(
    ({ children }: { children: React.ReactNode }) => {
      const tableRef = useTableContext().tableRef;
      const { width, height } = useTableProps({
        callback: (props) => {
          return {
            width: props.uiProps.width,
            height: props.uiProps.height,
          };
        },
        dependencies: [{ type: "ui_props" }],
        areCallbackOutputEqual: shallowEqual,
      });
      const cssVars = useTableCssVars();
      const [containerRef, setContainerRef] =
        React.useState<HTMLDivElement | null>(null);

      useEffect(() => {
        if (containerRef) {
          const cleanup =
            this.selectionManager.setupContainerElement(containerRef);
          return cleanup;
        }
      }, [containerRef]);

      useEffect(() => {
        return this.selectionManager.listenToCopy(() => {
          const boundingRect =
            this.selectionManager.getSelectionsBoundingRect();
          if (!boundingRect) return;

          const table = tableRef.current.tanstackTable;
          const allSelections =
            this.selectionManager.getNonOverlappingSelections();

          if (allSelections.length === 0) return;

          const rows = table.getRowModel().rows;

          // Create a 2D grid covering the entire bounding rectangle
          const gridHeight = boundingRect.end.row - boundingRect.start.row + 1;
          const gridWidth = boundingRect.end.col - boundingRect.start.col + 1;

          // Initialize grid with empty strings
          const grid: string[][] = Array(gridHeight)
            .fill(null)
            .map(() => Array(gridWidth).fill(""));

          // Fill in the grid with values from selected cells only
          for (const selection of allSelections) {
            for (
              let rowIdx = selection.start.row;
              rowIdx <= selection.end.row;
              rowIdx++
            ) {
              const row = rows[rowIdx];
              if (!row) continue;

              const cells = row.getVisibleCells();

              for (
                let colIdx = selection.start.col;
                colIdx <= selection.end.col;
                colIdx++
              ) {
                const cell = cells[colIdx];

                // Calculate position in the grid relative to bounding rect
                const gridRow = rowIdx - boundingRect.start.row;
                const gridCol = colIdx - boundingRect.start.col;

                if (cell) {
                  const valueToString =
                    cell.column.columnDef.meta?.valueToString;
                  const tblValue = cell.getValue();
                  const value = valueToString
                    ? valueToString(tblValue)
                    : tblValue;
                  // Convert value to string, handling null/undefined
                  let stringValue = "";
                  if (typeof value === "string") {
                    stringValue = value;
                  } else if (typeof value === "number") {
                    stringValue = value.toString();
                  } else if (typeof value === "boolean") {
                    stringValue = value.toString();
                  } else if (!value) {
                    stringValue = "";
                  }

                  // Escape tabs and newlines for TSV format
                  const escapedValue = stringValue
                    .replace(/\t/g, "    ")
                    .replace(/\n/g, " ")
                    .replace(/\r/g, "");
                  grid[gridRow][gridCol] = escapedValue;
                }
                // If no cell exists, grid[gridRow][gridCol] remains empty string
              }
            }
          }

          // Convert grid to TSV format
          const tsvString = grid.map((row) => row.join("\t")).join("\n");

          // Write to clipboard
          writeToClipboard(tsvString);
        });
      }, [tableRef]);

      return (
        <SelectionManagerProvider selectionManager={this.selectionManager}>
          <Paper
            className="rttui-overlay-container"
            elevation={2}
            ref={setContainerRef}
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
              ...cssVars,
            }}
          >
            {children}
          </Paper>
        </SelectionManagerProvider>
      );
    },
  );
  ScrollContainer = React.memo(
    ({ children }: { children: React.ReactNode }) => {
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
  );
  TableScroller = () => {
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
  };
  TableHeader = ({ children }: { children: React.ReactNode }) => {
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
  };
  TableFooter = ({ children }: { children: React.ReactNode }) => {
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
  };
  HeaderRow = TableHeaderRow;
  HeaderCell = React.memo(
    React.forwardRef<HTMLDivElement, React.ComponentProps<Skin["HeaderCell"]>>(
      (props, ref) => {
        return <TableHeaderCell {...props} ref={ref} />;
      },
    ),
  );
  TableBody = ({ children }: { children: React.ReactNode }) => {
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
  };
  PinnedRows = ({
    children,
    position,
  }: {
    children: React.ReactNode;
    position: "top" | "bottom";
  }) => {
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
  };
  PinnedCols = React.memo(
    ({
      children,
      position,
    }: {
      children: React.ReactNode;
      position: "left" | "right";
    }) => {
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
  );

  TableRowWrapper = React.memo(
    React.forwardRef<
      HTMLDivElement,
      React.ComponentProps<Skin["TableRowWrapper"]>
    >(({ children }, ref) => {
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
  );
  TableRow = React.memo(({ children }: { children: React.ReactNode }) => {
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
  });
  TableRowExpandedContent = React.memo(
    ({ children }: { children: React.ReactNode }) => {
      const { leafColLength } = useTableProps({
        callback: (table) => {
          return {
            leafColLength: table.tanstackTable.getVisibleLeafColumns().length,
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
    },
  );
  Cell = React.memo(
    React.forwardRef<HTMLDivElement, React.ComponentProps<Skin["Cell"]>>(
      ({ isMeasureInstance, children }, ref) => {
        const {
          isPinned,
          isLastPinned,
          isLast,
          isLastCenter,
          width,
          isSomeColumnsPinnedRight,
          row,
          isSpreadsheetRowHeader,
          value,
          renderInput,
          tanstackColIndex,
          metaIndex,
        } = useCellProps({
          callback: (cell, table) => {
            const state = cell.header.state;
            const isSpreadsheetRowHeader =
              cell.cell.column.columnDef.meta?.isSpreadsheetRowHeader;
            const valueToString =
              cell.cell.column.columnDef.meta?.valueToString;
            return {
              row: cell.rowIndex,
              tanstackColIndex: cell.cell.column.getIndex(),
              isPinned: state.isPinned,
              isLastPinned: state.isLastPinned,
              isLast: state.isLast,
              isLastCenter: state.isLastCenter,
              width: state.width,
              isSomeColumnsPinnedRight:
                table.tanstackTable.getIsSomeColumnsPinned("right"),
              isSpreadsheetRowHeader,
              value: valueToString
                ? valueToString(cell.cell.getValue())
                : cell.cell.getValue(),
              renderInput: cell.cell.column.columnDef.meta?.renderInput,
              metaIndex: cell.cell.column.columnDef.meta?.index,
            };
          },
          areCallbackOutputEqual: shallowEqual,
          dependencies: [{ type: "tanstack_table" }],
        });

        const [refEl, setRefEl] = React.useState<HTMLDivElement | null>(null);

        useImperativeHandle(ref, () => {
          return refEl!;
        }, [refEl]);

        const _spreadsheetColIndex = useSpreadsheetColIndex(tanstackColIndex);
        const spreadsheetColIndex = metaIndex ?? _spreadsheetColIndex

        const cellRef = useCallback(
          (el: HTMLDivElement | null) => {
            setRefEl(el);
            if (el) {
              if (isSpreadsheetRowHeader) {
                return this.selectionManager.setupHeaderElement(el, row, "row");
              }
              if (spreadsheetColIndex !== null) {
                return this.selectionManager.setupCellElement(el, {
                  row,
                  col: spreadsheetColIndex,
                });
              }
            }
          },
          [row, isSpreadsheetRowHeader, spreadsheetColIndex],
        );

        const isSelected = useSelectionManager(this.selectionManager, () => {
          if (spreadsheetColIndex === null) {
            return false;
          }
          return this.selectionManager.isSelected({
            row,
            col: spreadsheetColIndex,
          });
        });

        const isEditing = useSelectionManager(this.selectionManager, () => {
          if (spreadsheetColIndex === null) {
            return false;
          }
          return this.selectionManager.isEditingCell(row, spreadsheetColIndex);
        });

        const inputRef = React.useCallback((el: HTMLInputElement | null) => {
          if (el) {
            el.select();
          }
        }, []);

        return (
          <TableCell
            className="td"
            component="div"
            ref={cellRef}
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
                padding: isEditing ? "0" : "6px 12px",
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
            {spreadsheetColIndex !== null && isEditing ? (
              renderInput ? (
                renderInput(value, this.selectionManager, {
                  col: spreadsheetColIndex,
                  row,
                })
              ) : (
                <Input
                  type="text"
                  sx={{
                    width: "100%",
                    height: "100%",
                    px: 1.5,
                    fontSize: "inherit",
                    color: "inherit",
                    fontWeight: "inherit",
                  }}
                  autoFocus
                  inputRef={inputRef}
                  defaultValue={value}
                  onBlur={() => {
                    this.selectionManager.cancelEditing();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      this.selectionManager.saveCellValue(
                        { rowIndex: row, colIndex: spreadsheetColIndex },
                        e.currentTarget.value,
                      );
                      this.selectionManager.cancelEditing();
                    } else if (e.key === "Escape") {
                      this.selectionManager.cancelEditing();
                    }
                  }}
                />
              )
            ) : (
              children
            )}
          </TableCell>
        );
      },
    ),
  );
  PinnedColsOverlay = React.memo(
    ({ position }: { position: "left" | "right" }) => {
      const width = useTableProps({
        callback: (table) => {
          if (!table.tanstackTable.getIsSomeColumnsPinned(position)) {
            return undefined;
          }
          return position === "left"
            ? table.tanstackTable.getLeftTotalSize()
            : table.tanstackTable.getRightTotalSize();
        },
        dependencies: [{ type: "tanstack_table" }],
        areCallbackOutputEqual: strictEqual,
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
  );
}

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
      disablePadding,
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
          disablePadding: vheader.header.column.columnDef.meta?.disablePadding,
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
            padding: disablePadding ? "0" : "0 12px",
          }}
        >
          {children}
        </Box>
      </TableCell>
    );
  }),
);
