import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import { MdExpandMore } from "react-icons/md";
import {
  columnToIndex,
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
import { User } from "@rttui/fixtures";
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

const numRows = 30;

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

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    spreadsheetCol?: string;
    formatValue?: (value: string) => any;
  }
}

const formulaEngine = new FormulaEngine();
export const workbookName = "workbook1";
export const sheetName = "sheet1";
formulaEngine.addWorkbook(workbookName);
formulaEngine.addSheet({ sheetName, workbookName });
const workbookSelectionManager = new WorkbookSelectionManager();

const columnHelper = decorateColumnHelper(createColumnHelper<any>(), {
  header: (original, context) => (
    <Header
      options
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
    const spreadsheetCol = context.column.columnDef.meta?.spreadsheetCol;
    if (!spreadsheetCol) {
      return original;
    }
    const colIndex = columnToIndex(spreadsheetCol);
    return (
      <Box
        sx={{
          ...formulaEngine.getCellStyle({
            workbookName,
            sheetName,
            colIndex,
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

const columns: ColumnDef<any, any>[] = [
  columnHelper.display({
    id: "spreadsheet-row-header",
    cell: (info) => <SpreadsheetRowHeader index={info.row.index} />,
    enablePinning: true,
    meta: {
      isSpreadsheetRowHeader: true,
    },
  }),

  columnHelper.accessor("A", {
    header: "First column",
    cell: (info) =>
      formulaEngine.getCellValue(
        { workbookName, sheetName, colIndex: 0, rowIndex: info.row.index },
        true,
      ),
    id: "A",
    size: 300, // Increased size to accommodate all controls
    meta: {
      spreadsheetCol: "A",
    },
  }),
  columnHelper.accessor("B", {
    header: "Second column",
    cell: (info) =>
      formulaEngine.getCellValue(
        { workbookName, sheetName, colIndex: 1, rowIndex: info.row.index },
        true,
      ),
    id: "B",
    size: 300,
    meta: {
      spreadsheetCol: "B",
    },
  }),
  columnHelper.accessor("C", {
    header: "Third column",
    cell: (info) =>
      formulaEngine.getCellValue(
        { workbookName, sheetName, colIndex: 2, rowIndex: info.row.index },
        true,
      ),
    id: "C",
    size: 300,
    meta: {
      spreadsheetCol: "C",
    },
  }),
  columnHelper.accessor("D", {
    header: "Fourth column",
    cell: (info) =>
      formulaEngine.getCellValue(
        { workbookName, sheetName, colIndex: 3, rowIndex: info.row.index },
        true,
      ),
    id: "D",
    size: 300,
    meta: {
      spreadsheetCol: "D",
    },
  }),
  columnHelper.accessor("E", {
    header: "Fifth column",
    cell: (info) =>
      formulaEngine.getCellValue(
        { workbookName, sheetName, colIndex: 4, rowIndex: info.row.index },
        true,
      ),
    id: "E",
    size: 300,
    meta: {
      spreadsheetCol: "E",
    },
  }),
];

const getSubRows = (row: User) => {
  return row.otherCountries;
};

const useTable = () => {
  const state = useEngine(formulaEngine);

  const data = React.useMemo(() => {
    const spreadsheetData = state.workbooks
      .get(workbookName)
      ?.sheets.get(sheetName)?.content;
    const data: any = [];
    for (let j = 0; j < numRows; j += 1) {
      const row: any = {};
      let hasData = false;
      for (let i = 0; i < columns.slice(1).length; i += 1) {
        const data = spreadsheetData?.get(
          getCellReference({ rowIndex: j, colIndex: i }),
        );
        set(row, indexToColumn(i), data);
        hasData = true;
      }
      if (hasData) {
        data[j] = row;
      }
    }
    return data;
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
  const { table, formulaEngine } = useTable();
  const selectionManager = useInitializeSelectionManager({
    getNumRows: () => ({ type: "number", value: numRows }),
    getNumCols: () => ({
      type: "number",
      value: table
        .getVisibleLeafColumns()
        .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader).length,
    }),
  });

  React.useEffect(() => {
    return selectionManager.listenToUpdateData((updates) => {
      const newData = new Map(
        formulaEngine.getSheet({ workbookName, sheetName })?.content ?? [],
      );
      const columns = table
        .getVisibleLeafColumns()
        .filter((col) => !col.columnDef.meta?.isSpreadsheetRowHeader);
      updates.forEach((update) => {
        const column = columns[update.colIndex];
        const spreadsheetCol = column.columnDef.meta?.spreadsheetCol;
        if (!spreadsheetCol) {
          return;
        }
        let value: any = update.value;
        const colIndex = columnToIndex(spreadsheetCol);
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
            rowIndex: update.rowIndex,
            colIndex,
          }),
          value,
        );
      });

      formulaEngine.setSheetContent({ workbookName, sheetName }, newData);
    });
  }, [selectionManager, formulaEngine, table]);

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
        if (ev.type === "extend") {
          formulaEngine.autoFill(
            { sheetName, workbookName },
            convertSmAreaToSpreadsheetRange(ev.seedRange),
            convertSmAreaToSpreadsheetRange(ev.fillRange),
            ev.direction,
          );
        } else {
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

          // Convert SMArea[] to RangeAddress[]
          const rangeAddresses: RangeAddress[] = selections.map(
            (smArea: SMArea) => {
              const range: SpreadsheetRange =
                convertSmAreaToSpreadsheetRange(smArea);
              return {
                workbookName,
                sheetName,
                range,
              };
            },
          );

          workbookSelectionManager.setSelections(rangeAddresses);
        },
      ),
    ];

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [formulaEngine, selectionManager]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
      <Accordion>
        <AccordionSummary
          expandIcon={<MdExpandMore />}
          aria-controls="formula-toolbar-content"
          id="formula-toolbar-header"
        >
          <Typography>Formula Toolbar</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ maxHeight: 400, overflow: "auto" }}>
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
            renderSubComponent={(row) => {
              return (
                <Box
                  component="pre"
                  sx={{
                    fontSize: "10px",
                    textAlign: "left",
                    px: 1,
                    py: 0,
                  }}
                >
                  <code>{JSON.stringify(row.original, null, 2)}</code>
                </Box>
              );
            }}
          />
        </AutoSizer>
      </Box>
    </Box>
  );
}
