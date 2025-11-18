import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { MdExpandMore, MdUndo, MdRedo, MdSave, MdLock } from "react-icons/md";
import {
  getCellReference,
  RangeAddress,
  SpreadsheetRange,
  SpreadsheetRangeEnd,
} from "@ricsam/formula-engine";
import {
  SMArea,
  useInitializeSelectionManager,
} from "@ricsam/selection-manager";
import { AutoSizer, ReactTanstackTableUi } from "@rttui/core";
import {
  FormulaToolbar,
  WorkbookSelectionManager,
} from "@anocca-pub/components";
import { BleuSkin, Resizer } from "@rttui/skin-bleu";
import React, { useMemo } from "react";

import { FormulaEngine, indexToColumn } from "@ricsam/formula-engine";
import { decorateColumnHelper } from "@rttui/core";
import {
  Cell,
  Filter,
  Header,
  SpreadsheetColHeader,
  SpreadsheetRowHeader,
} from "@rttui/skin-bleu";
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowData,
  useReactTable,
} from "@tanstack/react-table";
import { set } from "lodash";
import { useState } from "react";
import { mapSmAreaToSourceRanges, areRowsConsecutive } from "./map_selections";

const numRows = 30;

// Context for fixed sort lock icon
const FixedSortContext = React.createContext<{ showLockIcon: boolean }>({
  showLockIcon: false,
});

function useEngine(
  engine: FormulaEngine,
): ReturnType<typeof FormulaEngine.prototype.getState> {
  const [state, setState] = useState<
    ReturnType<typeof FormulaEngine.prototype.getState>
  >(() => engine.getState());

  React.useEffect(() => {
    return engine.onUpdate(() => {
      setState(engine.getState());
    });
  }, [engine]);

  return state;
}

function useHistoryManager(engine: FormulaEngine) {
  const [history, setHistory] = useState<any[]>(() => [
    engine.serializeEngine(),
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedSerializedEngine, setSavedSerializedEngine] = useState<any>(
    () => {
      const saved = localStorage.getItem("spreadsheet-state");
      return saved ? JSON.parse(saved) : engine.serializeEngine();
    },
  );
  const isUndoingRef = React.useRef(false);
  const engineRef = React.useRef(engine);
  engineRef.current = engine;

  const pushState = React.useCallback(
    (serialized: any) => {
      if (isUndoingRef.current) {
        return;
      }
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(serialized);
        return newHistory;
      });
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex],
  );

  const pushStateRef = React.useRef(pushState);
  pushStateRef.current = pushState;

  React.useEffect(() => {
    const cleanup = engineRef.current.onUpdate(() => {
      if (isUndoingRef.current) {
        return;
      }
      const serialized = engineRef.current.serializeEngine();
      pushStateRef.current(serialized);
    });

    return () => {
      cleanup();
    };
  }, []);

  const undo = React.useCallback(() => {
    if (currentIndex > 0) {
      isUndoingRef.current = true;
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      engineRef.current.resetToSerializedEngine(history[newIndex]);
      isUndoingRef.current = false;
    }
  }, [currentIndex, history]);

  const redo = React.useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoingRef.current = true;
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      engineRef.current.resetToSerializedEngine(history[newIndex]);
      isUndoingRef.current = false;
    }
  }, [currentIndex, history]);

  const save = React.useCallback(() => {
    const serialized = engineRef.current.serializeEngine();
    localStorage.setItem("spreadsheet-state", JSON.stringify(serialized));
    setSavedSerializedEngine(serialized);
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  // Calculate hasUnsavedChanges by comparing current state with saved state
  const currentSerializedEngine = history[currentIndex];
  const hasUnsavedChanges =
    JSON.stringify(currentSerializedEngine) !==
    JSON.stringify(savedSerializedEngine);

  return { undo, redo, save, canUndo, canRedo, hasUnsavedChanges };
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    formatValue?: (value: string) => any;
  }
}

const formulaEngine = new FormulaEngine();
export const workbookName = "workbook1";
export const sheetName = "sheet1";

// Try to load saved state from localStorage
const savedState = localStorage.getItem("spreadsheet-state");
if (savedState) {
  try {
    const parsed = JSON.parse(savedState);
    formulaEngine.resetToSerializedEngine(parsed);
  } catch (error) {
    console.error("Failed to load saved state:", error);
    // If loading fails, initialize normally
    formulaEngine.addWorkbook(workbookName);
    formulaEngine.addSheet({ sheetName, workbookName });
  }
} else {
  formulaEngine.addWorkbook(workbookName);
  formulaEngine.addSheet({ sheetName, workbookName });
}

const workbookSelectionManager = new WorkbookSelectionManager();

const columnHelper = decorateColumnHelper(createColumnHelper<any>(), {
  header: (original, context) => (
    <Header
      options={!context.column.id.includes("spreadsheet-row-header")}
      accessibleResizer
      sorting
      checkbox={context.column.id.endsWith("full-name")}
      resizer
    >
      {original}
    </Header>
  ),
  filter: () => <Filter resizer />,
  extraHeaders: [
    {
      id: "spreadsheet-col-header",
      header: (props) => {
        const tableColIndex = props.column.getIndex();
        return <SpreadsheetColHeader tableColIndex={tableColIndex} />;
      },
      meta: {
        disablePadding: true,
      },
    },
  ],
  cell: (original, context) => {
    if (context.column.columnDef.meta?.isSpreadsheetRowHeader) {
      return original;
    }
    const spreadsheetCol = context.column.columnDef.meta?.index;
    if (spreadsheetCol === undefined) {
      return original;
    }
    return (
      <Box
        sx={{
          ...formulaEngine.getCellStyle({
            workbookName,
            sheetName,
            colIndex: spreadsheetCol,
            rowIndex: context.row.index,
          }),
          flex: 1,
          padding: "6px 12px",
        }}
      >
        <Cell
          {...(context.column.id.endsWith("full-name")
            ? { checkbox: true, expandButton: true, pinButtons: true }
            : {})}
        >
          {original}
        </Cell>
      </Box>
    );
  },
});

const RowHeaderWithLockIcon = () => {
  const { showLockIcon } = React.useContext(FixedSortContext);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      Row index
      {showLockIcon && <MdLock fontSize="small" style={{ fontSize: 14 }} />}
    </Box>
  );
};

const columns: ColumnDef<any, any>[] = [
  columnHelper.accessor("id", {
    id: "spreadsheet-row-header",
    cell: (info) => <SpreadsheetRowHeader index={info.row.index} />,
    header: () => <RowHeaderWithLockIcon />,
    enableSorting: true,
    enablePinning: true,
    sortingFn: (rowA, rowB) => {
      if (fixedRowOrderForSorting.length === 0) {
        // No fixed order, use default
        return rowA.original.id - rowB.original.id;
      }
      const indexA = fixedRowOrderForSorting.indexOf(rowA.original.id);
      const indexB = fixedRowOrderForSorting.indexOf(rowB.original.id);
      if (indexA === -1 || indexB === -1) {
        // Fallback for rows not in fixed order
        return rowA.original.id - rowB.original.id;
      }
      return indexA - indexB;
    },
    meta: {
      isSpreadsheetRowHeader: true,
      autoCrushMaxSize: 160,
    },
  }),

  columnHelper.accessor("A", {
    header: "First column",
    id: "A",
    size: 300, // Increased size to accommodate all controls
    meta: {
      index: 0,
    },
  }),
  columnHelper.accessor("B", {
    header: "Second column",
    id: "B",
    size: 300,
    meta: {
      index: 1,
    },
  }),
  columnHelper.accessor("C", {
    header: "Third column",
    id: "C",
    size: 300,
    meta: {
      index: 2,
    },
  }),
  columnHelper.accessor("D", {
    header: "Fourth column",
    id: "D",
    size: 300,
    meta: {
      index: 3,
    },
  }),
  columnHelper.accessor("E", {
    header: "Fifth column",
    id: "E",
    size: 300,
    meta: {
      index: 4,
    },
  }),
];

const getSubRows = (row: any) => {
  return row.otherCountries;
};

// Global ref to store fixed row order for custom sorting function
let fixedRowOrderForSorting: number[] = [];

const useTable = (fixedRowOrder: number[], onClearFixedOrder: () => void) => {
  const state = useEngine(formulaEngine);
  const [userSorting, setUserSorting] = React.useState<any[]>([]);

  // Wrapper that clears fixed order when user manually sorts
  const handleSortingChange = React.useCallback(
    (updater: any) => {
      setUserSorting(updater);
      onClearFixedOrder();
    },
    [onClearFixedOrder],
  );

  // Compute actual sorting based on fixed order
  const actualSorting = React.useMemo(() => {
    if (fixedRowOrder.length > 0) {
      // Fixed order is active - override with sort by id
      return [
        {
          id: "_decorator_extra_header_0__decorator_filter_spreadsheet-row-header",
          desc: false,
        },
      ];
    }
    // No fixed order - use user's manual sorting
    return userSorting;
  }, [fixedRowOrder, userSorting]);

  const data = React.useMemo(() => {
    const data: any = [];
    for (let j = 0; j < numRows; j += 1) {
      const row: any = { id: j };
      for (let i = 0; i < columns.slice(1).length; i += 1) {
        const value = formulaEngine.getCellValue(
          { workbookName, sheetName, colIndex: i, rowIndex: j },
          true,
        );
        set(row, indexToColumn(i), value);
      }
      data.push(row);
    }
    return data;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    enableColumnFilters: true,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowPinning: true,
    enableColumnPinning: true,
    columnResizeMode: "onChange",
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getSubRows,
    enableRowSelection: true,
    keepPinnedRows: true,
    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: actualSorting,
    },
    onSortingChange: handleSortingChange,
    initialState: {
      columnPinning: {
        left: [
          "_decorator_extra_header_0__decorator_filter_spreadsheet-row-header",
        ],
      },
    },
  });
  return { table, data, formulaEngine };
};

export function App() {
  const [fixedRowOrder, setFixedRowOrder] = useState<number[]>([]);
  
  const handleClearFixedOrder = React.useCallback(() => {
    setFixedRowOrder([]);
    fixedRowOrderForSorting = [];
  }, []);

  const { table, formulaEngine } = useTable(fixedRowOrder, handleClearFixedOrder);
  const selectionManager = useInitializeSelectionManager({
    getNumRows: () => ({ type: "number", value: numRows }),
    getNumCols: () => ({
      type: "number",
      value: table
        .getVisibleLeafColumns()
        .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader).length,
    }),
  });

  const history = useHistoryManager(formulaEngine);
  const [currentCell, setCurrentCell] = useState<string | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [isFixedSortEnabled, setIsFixedSortEnabled] = useState(false);

  const currentCellRef = React.useRef<string | null>(null);
  currentCellRef.current = currentCell;
  const tableRef = React.useRef(table);
  tableRef.current = table;
  const isFixedSortEnabledRef = React.useRef(isFixedSortEnabled);
  isFixedSortEnabledRef.current = isFixedSortEnabled;
  const fixedRowOrderRef = React.useRef(fixedRowOrder);
  fixedRowOrderRef.current = fixedRowOrder;

  // Toggle handler for fixed sort
  const handleToggleFixedSort = (enabled: boolean) => {
    setIsFixedSortEnabled(enabled);
    if (!enabled) {
      handleClearFixedOrder();
    }
    // Don't capture order here - wait for first edit
  };

  // Keyboard shortcuts for undo/redo
  const historyRef = React.useRef(history);
  historyRef.current = history;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === "z") {
        if (e.shiftKey) {
          // Cmd/Ctrl+Shift+Z = Redo
          e.preventDefault();
          historyRef.current.redo();
        } else {
          // Cmd/Ctrl+Z = Undo
          e.preventDefault();
          historyRef.current.undo();
        }
      } else if (cmdOrCtrl && e.key === "y") {
        // Cmd/Ctrl+Y = Redo (alternative shortcut)
        e.preventDefault();
        historyRef.current.redo();
      } else if (cmdOrCtrl && e.key === "s") {
        // Cmd/Ctrl+S = Save
        e.preventDefault();
        historyRef.current.save();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  React.useEffect(() => {
    return selectionManager.listenToUpdateData((updates) => {
      const newData = new Map(
        formulaEngine.getSheet({ workbookName, sheetName })?.content ?? [],
      );
      const tableRows = tableRef.current.getRowModel().rows;
      const visibleColumns = tableRef.current
        .getVisibleLeafColumns()
        .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader);

      updates.forEach((update) => {
        // Map visual row to source row
        if (update.rowIndex >= tableRows.length) {
          console.error(`Update row ${update.rowIndex} out of bounds`);
          return;
        }
        const sourceRowIndex = tableRows[update.rowIndex].index;

        // Map visual column to source column
        if (update.colIndex >= visibleColumns.length) {
          console.error(`Update column ${update.colIndex} out of bounds`);
          return;
        }
        const sourceColIndex =
          visibleColumns[update.colIndex].columnDef.meta?.index;
        if (sourceColIndex === undefined) {
          console.error(
            `Column at index ${update.colIndex} has no index metadata`,
          );
          return;
        }

        let value: any = update.value;
        if (typeof value === "string") {
          const numberResult = isNumber(value);
          if (numberResult.isNumber) {
            value = numberResult.value;
          } else {
            const booleanResult = isBoolean(value);
            if (booleanResult.isBoolean) {
              value = booleanResult.value;
            }
          }
        }

        newData.set(
          getCellReference({
            rowIndex: sourceRowIndex,
            colIndex: sourceColIndex,
          }),
          value,
        );
      });

      formulaEngine.setSheetContent({ workbookName, sheetName }, newData);

      // Capture fixed sort order if enabled
      if (isFixedSortEnabledRef.current) {
        const currentRows = tableRef.current.getRowModel().rows;
        const order = currentRows.map((row) => row.original.id);
        setFixedRowOrder(order);
        fixedRowOrderForSorting = order;
      }
    });
  }, [selectionManager, formulaEngine]);

  const skin = useMemo(
    () =>
      new BleuSkin(selectionManager, {
        padding: 0,
      }),
    [selectionManager],
  );

  // Selection manager effects for tracking cell selection
  React.useEffect(() => {
    const convertSmAreaToSpreadsheetRange = (
      area: SMArea,
    ): SpreadsheetRange => {
      const rowEnd: SpreadsheetRangeEnd =
        area.end.row.type === "infinity"
          ? {
              type: "infinity",
              sign: "positive",
            }
          : {
              type: "number",
              value: area.end.row.value,
            };
      const colEnd: SpreadsheetRangeEnd =
        area.end.col.type === "infinity"
          ? {
              type: "infinity",
              sign: "positive",
            }
          : {
              type: "number",
              value: area.end.col.value,
            };
      return {
        start: {
          col: area.start.col,
          row: area.start.row,
        },
        end: {
          row: rowEnd,
          col: colEnd,
        },
      };
    };

    const cleanups = [
      selectionManager.listenToFill((ev) => {
        // Create mapper function for row validation
        const tableRows = tableRef.current.getRowModel().rows;
        const visualToSourceRow = (visualRow: number): number => {
          if (visualRow >= tableRows.length) {
            throw new Error(`Visual row ${visualRow} out of bounds`);
          }
          return tableRows[visualRow].index;
        };

        if (ev.type === "extend") {
          // Validate that both seedRange and fillRange have consecutive source rows
          const seedConsecutive = areRowsConsecutive(
            ev.seedRange,
            visualToSourceRow,
            numRows,
          );
          const fillConsecutive = areRowsConsecutive(
            ev.fillRange,
            visualToSourceRow,
            numRows,
          );

          if (!seedConsecutive || !fillConsecutive) {
            console.warn(
              "Fill operation blocked: rows are non-consecutive due to sorting/filtering",
            );
            return; // Block the fill operation
          }

          formulaEngine.autoFill(
            { sheetName, workbookName },
            convertSmAreaToSpreadsheetRange(ev.seedRange),
            convertSmAreaToSpreadsheetRange(ev.fillRange),
            ev.direction,
          );
        } else {
          // Validate rangeToClear has consecutive rows
          const clearConsecutive = areRowsConsecutive(
            ev.rangeToClear,
            visualToSourceRow,
            numRows,
          );

          if (!clearConsecutive) {
            console.warn(
              "Clear operation blocked: rows are non-consecutive due to sorting/filtering",
            );
            return; // Block the clear operation
          }

          formulaEngine.clearSpreadsheetRange({
            sheetName,
            workbookName,
            range: convertSmAreaToSpreadsheetRange(ev.rangeToClear),
          });
        }
      }),
      // Emit selection changes to WorkbookSelectionManager
      selectionManager.observeStateChange(
        (state) => {
          // Return a serialized version to properly detect changes
          return JSON.stringify(state.selections);
        },
        (selectionsJson) => {
          const selections = JSON.parse(selectionsJson);

          if (!selectionManager) {
            return;
          }

          // Don't emit empty selections
          if (!selections || selections.length === 0) {
            return;
          }

          // Create mapper functions for visual to source coordinate conversion
          const tableRows = tableRef.current.getRowModel().rows;
          const columns = tableRef.current
            .getVisibleLeafColumns()
            .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader);

          const visualToSourceRow = (visualRow: number): number => {
            if (visualRow >= tableRows.length) {
              throw new Error(`Visual row ${visualRow} out of bounds`);
            }
            return tableRows[visualRow].index;
          };

          const visualToSourceCol = (visualCol: number): number => {
            if (visualCol >= columns.length) {
              throw new Error(`Visual column ${visualCol} out of bounds`);
            }
            const column = columns[visualCol];
            const spreadsheetCol = column.columnDef.meta?.index;
            if (spreadsheetCol === undefined) {
              throw new Error(
                `Column at visual index ${visualCol} has no spreadsheetCol metadata`,
              );
            }
            return spreadsheetCol;
          };

          // Convert SMArea[] to RangeAddress[] using proper source coordinate mapping
          const rangeAddresses: RangeAddress[] = [];

          for (const smArea of selections) {
            try {
              const sourceRanges = mapSmAreaToSourceRanges(
                smArea,
                visualToSourceRow,
                visualToSourceCol,
                numRows,
                columns.length,
              );

              // Convert each source range to a RangeAddress
              for (const sourceRange of sourceRanges) {
                const range: SpreadsheetRange = {
                  start: {
                    row: sourceRange.start.row,
                    col: sourceRange.start.col,
                  },
                  end: {
                    row: { type: "number", value: sourceRange.end.row },
                    col: { type: "number", value: sourceRange.end.col },
                  },
                };
                rangeAddresses.push({
                  workbookName,
                  sheetName,
                  range,
                });
              }
            } catch (error) {
              console.error("Error mapping selection:", error);
            }
          }

          workbookSelectionManager.setSelections(rangeAddresses);
        },
      ),
      // Track current cell for formula bar
      selectionManager.observeStateChange(
        (state) => {
          return JSON.stringify(state.selections);
        },
        (selectionsJson) => {
          const selections = JSON.parse(selectionsJson);
          if (!selections || selections.length === 0) {
            setCurrentCell(null);
            setFormulaBarValue("");
            return;
          }

          // Get first cell of first selection
          const firstSelection = selections[0] as SMArea;

          // Create mapper functions for visual to source coordinate conversion
          const tableRows = tableRef.current.getRowModel().rows;
          const columns = tableRef.current
            .getVisibleLeafColumns()
            .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader);

          try {
            // Map visual row to source row
            if (firstSelection.start.row >= tableRows.length) {
              setCurrentCell(null);
              setFormulaBarValue("");
              return;
            }
            const sourceRowIndex = tableRows[firstSelection.start.row].index;

            // Map visual column to source column
            if (firstSelection.start.col >= columns.length) {
              setCurrentCell(null);
              setFormulaBarValue("");
              return;
            }
            const column = columns[firstSelection.start.col];
            const spreadsheetCol = column.columnDef.meta?.index;
            if (spreadsheetCol === undefined) {
              setCurrentCell(null);
              setFormulaBarValue("");
              return;
            }

            const cellRef = getCellReference({
              rowIndex: sourceRowIndex,
              colIndex: spreadsheetCol,
            });
            setCurrentCell(cellRef);

            // Get raw value from formula engine
            const sheetContent = formulaEngine.getSheet({
              workbookName,
              sheetName,
            })?.content;
            const rawValue = sheetContent?.get(cellRef);
            setFormulaBarValue(
              rawValue !== undefined && rawValue !== null
                ? String(rawValue)
                : "",
            );
          } catch (error) {
            console.error("Error mapping formula bar cell:", error);
            setCurrentCell(null);
            setFormulaBarValue("");
          }
        },
      ),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [formulaEngine, selectionManager]);

  const handleFormulaBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulaBarValue(e.target.value);
  };

  const handleFormulaBarBlur = () => {
    if (!currentCell) return;

    const newData = new Map(
      formulaEngine.getSheet({ workbookName, sheetName })?.content ?? [],
    );

    let value: any = formulaBarValue;
    if (typeof value === "string") {
      const numberResult = isNumber(value);
      if (numberResult.isNumber) {
        value = numberResult.value;
      } else {
        const booleanResult = isBoolean(value);
        if (booleanResult.isBoolean) {
          value = booleanResult.value;
        }
      }
    }

    newData.set(currentCell, value);
    formulaEngine.setSheetContent({ workbookName, sheetName }, newData);
  };

  const handleFormulaBarKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      handleFormulaBarBlur();
    }
  };

  // Detect platform for keyboard shortcut labels
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <FixedSortContext.Provider value={{ showLockIcon: fixedRowOrder.length > 0 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
        {/* Toolbar with formula bar and action buttons */}
        <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          padding: 1,
          backgroundColor: "background.paper",
          borderRadius: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ minWidth: "60px", fontWeight: "medium" }}
        >
          {currentCell || ""}
        </Typography>
        <TextField
          size="small"
          fullWidth
          value={formulaBarValue}
          onChange={handleFormulaBarChange}
          onBlur={handleFormulaBarBlur}
          onKeyDown={handleFormulaBarKeyDown}
          onFocus={() => {
            selectionManager.blur();
          }}
          placeholder="Enter formula or value"
          sx={{ flex: 1 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isFixedSortEnabled}
              onChange={(e) => handleToggleFixedSort(e.target.checked)}
              size="small"
            />
          }
          label="Fixed Sort"
          sx={{ marginLeft: 1, marginRight: 1 }}
        />
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title={`Undo (${modKey}+Z)`}>
            <span>
              <IconButton
                size="small"
                onClick={history.undo}
                disabled={!history.canUndo}
              >
                <MdUndo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Redo (${modKey}+Shift+Z or ${modKey}+Y)`}>
            <span>
              <IconButton
                size="small"
                onClick={history.redo}
                disabled={!history.canRedo}
              >
                <MdRedo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={`Save (${modKey}+S)`}>
            <span>
              <Button
                size="small"
                variant={history.hasUnsavedChanges ? "contained" : "outlined"}
                startIcon={<MdSave />}
                onClick={history.save}
                disabled={!history.hasUnsavedChanges}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Accordion>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="formula-toolbar-content"
          id="formula-toolbar-header"
        >
          <Typography>Formula Toolbar</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ maxHeight: 400, overflow: "auto", fontFamily: "system-ui" }}
        >
          <FormulaToolbar
            selectionManager={workbookSelectionManager}
            engine={formulaEngine}
            workbookName={workbookName}
            activeSheet={sheetName}
          />
        </AccordionDetails>
      </Accordion>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <AutoSizer
          style={{ flex: 1, minHeight: 500 }}
          adaptContainerToTable={{
            width: false,
            height: false,
          }}
          adaptTableToContainer={{
            width: true,
            height: true,
          }}
        >
          <ReactTanstackTableUi
            table={table}
            skin={skin}
            renderHeaderPlaceholder={() => {
              return <Resizer />;
            }}
            pinRowsRelativeTo="table"
          />
        </AutoSizer>
      </Box>
    </Box>
    </FixedSortContext.Provider>
  );
}

function isNumber(
  value: string,
): { isNumber: true; value: number } | { isNumber: false } {
  // Empty string should not be treated as a number
  if (value === "") {
    return { isNumber: false };
  }

  // Handle comma as decimal separator (European style)
  const normalizedValue = value.replace(",", ".");

  // Check if it's a valid number
  const parsed = parseFloat(normalizedValue);

  // Make sure the entire string was consumed (no trailing characters)
  // and that it's a valid number
  if (
    !isNaN(parsed) &&
    isFinite(parsed) &&
    normalizedValue === String(parsed)
  ) {
    return { isNumber: true, value: parsed };
  }

  return { isNumber: false };
}

function isBoolean(
  value: string,
): { isBoolean: true; value: boolean } | { isBoolean: false } {
  const lowerValue = value.toLowerCase().trim();

  // True values
  if (lowerValue === "true" || lowerValue === "yes" || lowerValue === "1") {
    return { isBoolean: true, value: true };
  }

  // False values
  if (lowerValue === "false" || lowerValue === "no" || lowerValue === "0") {
    return { isBoolean: true, value: false };
  }

  return { isBoolean: false };
}
