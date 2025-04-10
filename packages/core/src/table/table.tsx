import { Column, Row, RowData, Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { MeasureCellProvider } from "../measure_cell_provider";
import { Skin } from "../skin";
import { getSubHeaders } from "../utils";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useVirtualRowContext } from "./rows/virtual_row_context";
import { VirtualRowProvider } from "./rows/virtual_row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { CellRefs, MeasureData, RttuiRef } from "./types";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    autoCrush?: boolean;
    fillAvailableSpaceAfterCrush?: boolean;
    crushMinSizeBy?: "header" | "cell" | "both";
  }
}

export const ReactTanstackTableUi = function ReactTanstackTableUi<T>(props: {
  table: Table<T>;
  rowDndHandler?: RowDndHandler<T>;
  colDndHandler?: ColDndHandler<T>;
  skin?: Skin;
  width?: number;
  height?: number;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (args: { row: Row<T> }) => React.ReactNode;
  underlay?: React.ReactNode;
  autoCrushColumns?: boolean;
  pinColsRelativeTo?: "cols" | "table";
  pinRowsRelativeTo?: "rows" | "table";
  crushMinSizeBy?: "header" | "cell" | "both";
  fillAvailableSpaceAfterCrush?: boolean;
  scrollbarWidth?: number;
  tableRef?: React.RefObject<RttuiRef | undefined>;
  autoCrushNumCols?: number;
}) {
  const { table } = props;
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  if (table.getIsSomeColumnsPinned() && !table.options.enableColumnPinning) {
    throw new Error(
      "column pinning will not work unless enableColumnPinning is set to true",
    );
  }

  const [consumerOnMeasureCb, setOnMeasureCb] = React.useState<
    undefined | ((measureData: MeasureData) => void)
  >(undefined);

  const measureCells = React.useCallback(
    (cb: (measureData: MeasureData) => void) =>
      setOnMeasureCb(() => {
        return (measureData: MeasureData) => {
          cb(measureData);
          setOnMeasureCb(undefined);
        };
      }),
    [],
  );
  const crushMinSizeBy = props.crushMinSizeBy ?? "header";

  const skin = props.skin ?? defaultSkin;

  const width = props.width ?? table.getTotalSize();

  const numHeaders = table
    .getHeaderGroups()
    .filter((group) =>
      group.headers.some((header) => header.column.columnDef.header),
    ).length;
  const numFooters = table
    .getFooterGroups()
    .filter((group) =>
      group.headers.some((header) => header.column.columnDef.footer),
    ).length;

  const height =
    props.height ??
    skin.headerRowHeight * numHeaders +
      skin.footerRowHeight * numFooters +
      skin.rowHeight * table.getRowCount();

  const refsValue = {
    table,
    props,
    crushMinSizeBy,
    width,
    height,
  };
  const refs = React.useRef(refsValue);
  refs.current = refsValue;

  const contrainSize = React.useCallback((size: number, col?: Column<any>) => {
    const maxSize =
      col?.columnDef?.maxSize ??
      refs.current.props.table.options.defaultColumn?.maxSize ??
      Number.POSITIVE_INFINITY;
    const minSize =
      col?.columnDef?.minSize ??
      refs.current.props.table.options.defaultColumn?.minSize ??
      0;
    return Math.max(Math.min(Math.max(size, minSize), maxSize), 0);
  }, []);

  const crushCols = React.useCallback(
    (cols: MeasureData["cols"]) => {
      refs.current.table.setColumnSizing((prev) => {
        const newSizing = { ...prev };

        const colsToCrush = new Map<string, CellRefs>();

        const getCrushMinSizeBy = (col?: Column<any>) => {
          return (
            col?.columnDef?.meta?.crushMinSizeBy ?? refs.current.crushMinSizeBy
          );
        };

        cols.forEach((col, colId) => {
          if (!col) {
            return;
          }
          const tsCol = refs.current.table.getColumn(colId);
          if (tsCol?.columnDef.meta?.autoCrush !== false) {
            colsToCrush.set(colId, col);
          } else {
            newSizing[colId] = contrainSize(
              newSizing[colId] ?? tsCol.getSize(),
              tsCol,
            );
          }
        });

        colsToCrush.forEach((col, colId) => {
          const tsCol = refs.current.table.getColumn(colId);
          const crushMinSizeBy = getCrushMinSizeBy(tsCol);

          const cells = Object.values(col);
          let widths = cells
            .filter(({ type }) => {
              if (crushMinSizeBy === "both") {
                return true;
              }
              return type === crushMinSizeBy;
            })
            .map(({ width }) => width);

          if (widths.length === 0) {
            if (cells.length === 0) {
              widths = [
                tsCol?.getSize() ??
                  refs.current.props.table.options.defaultColumn?.size ??
                  0,
              ];
            } else {
              widths = cells.map(({ width }) => width);
            }
          }
          const colWidth = Math.max(...widths);
          newSizing[colId] = contrainSize(colWidth, tsCol);
        });

        //#region size by largest header
        // maybe add one more option to crushMinSizeBy to size by largest header, but for now it is enabled by default
        colsToCrush.forEach((col, colId) => {
          Object.values(col).forEach((cell) => {
            if (cell.type === "header") {
              const header = cell.header;
              if (header) {
                const crushMinSizeBy = getCrushMinSizeBy(header.column);
                if (crushMinSizeBy === "cell") {
                  return;
                }
                const headerWidth = contrainSize(
                  newSizing[colId],
                  header.column,
                );
                let leafTotal = 0;
                const leafs = getSubHeaders(header);
                leafs.forEach((h) => {
                  leafTotal += contrainSize(
                    newSizing[h.column.id] ?? h.column.getSize(),
                    h.column,
                  );
                });

                const nonConstrainedCols = new Set<string>();

                let totalWhenColsAreConstrained = 0;

                if (leafTotal < headerWidth) {
                  const diff = headerWidth - leafTotal;
                  const perCol = diff / leafs.length;
                  leafs.forEach((h) => {
                    const newSize = Math.max(
                      (newSizing[h.column.id] ?? h.column.getSize()) + perCol,
                      0,
                    );
                    newSizing[h.column.id] = contrainSize(newSize, h.column);

                    totalWhenColsAreConstrained += newSizing[h.column.id];

                    if (newSize === newSizing[h.column.id]) {
                      nonConstrainedCols.add(h.column.id);
                    }
                  });
                }
                if (leafTotal < totalWhenColsAreConstrained) {
                  const diff = totalWhenColsAreConstrained - leafTotal;
                  const perCol = diff / nonConstrainedCols.size;
                  nonConstrainedCols.forEach((colId) => {
                    newSizing[colId] += perCol;
                  });
                }
              }
            }
          });
        });
        //#endregion

        return newSizing;
      });
    },
    [contrainSize],
  );

  const fillAvailableSpaceAfterCrush = React.useCallback(
    (cols: MeasureData["cols"]) => {
      refs.current.table.setColumnSizing((prev) => {
        const newSizing = { ...prev };

        //#region fill available space after crush
        const totalWidth =
          refs.current.width - (refs.current.props.scrollbarWidth ?? 0);

        const leafCols = new Set<string>();
        cols.forEach((_, colId) => {
          const tsCol = refs.current.table.getColumn(colId);
          if (tsCol) {
            tsCol.getLeafColumns().forEach((leafCol) => {
              leafCols.add(leafCol.id);
            });
          }
        });
        let totalSize = 0;
        const colsThatCanFill = new Set<Column<T, unknown>>();

        const getSize = (colId: string, col?: Column<T, unknown>) => {
          return (
            newSizing[colId] ??
            col?.getSize() ??
            refs.current.props.table.options.defaultColumn?.size ??
            0
          );
        };

        leafCols.forEach((colId) => {
          const tsCol = refs.current.table.getColumn(colId);
          totalSize += contrainSize(getSize(colId, tsCol), tsCol);
          if (
            tsCol &&
            tsCol?.columnDef.meta?.fillAvailableSpaceAfterCrush !== false
          ) {
            colsThatCanFill.add(tsCol);
          }
        });
        if (
          refs.current.props.fillAvailableSpaceAfterCrush &&
          totalSize < totalWidth
        ) {
          let totalWhenColsAreConstrained = 0;
          const nonConstrainedCols = new Set<Column<T, unknown>>();
          const delta = totalWidth - totalSize;
          const perColumnDelta = delta / colsThatCanFill.size;
          colsThatCanFill.forEach((col) => {
            const newSize = getSize(col.id, col) + perColumnDelta;
            newSizing[col.id] = contrainSize(newSize, col);
            totalWhenColsAreConstrained += newSizing[col.id];
            if (newSize === newSizing[col.id]) {
              nonConstrainedCols.add(col);
            }
          });
          if (totalWhenColsAreConstrained < totalWidth) {
            const diff = totalWidth - totalWhenColsAreConstrained;
            const perCol = diff / nonConstrainedCols.size;
            nonConstrainedCols.forEach((col) => {
              newSizing[col.id] += perCol;
            });
          }
        }
        //#endregion

        return newSizing;
      });
    },
    [contrainSize],
  );

  const onMeasureCb = React.useCallback(
    (cols: MeasureData["cols"]) => {
      crushCols(cols);
      fillAvailableSpaceAfterCrush(cols);
    },
    [crushCols, fillAvailableSpaceAfterCrush],
  );

  const autoSizeColumns = React.useCallback(() => {
    measureCells(({ cols }) => onMeasureCb(cols));
  }, [measureCells, onMeasureCb]);

  React.useEffect(() => {
    if (props.autoCrushColumns) {
      autoSizeColumns();
    }
  }, [autoSizeColumns, props.autoCrushColumns]);

  if (props.tableRef) {
    props.tableRef.current = {
      autoSizeColumns,
    };
  }

  return (
    <div
      className="rttui-table-container"
      style={{
        width: width + "px",
        height: height + "px",
        position: "relative",
      }}
    >
      {/* For measuring all cols */}
      {consumerOnMeasureCb && (
        <div
          className="rttui-measure-container"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            visibility: "hidden",
            pointerEvents: "none",
            zIndex: -1,
          }}
        >
          <MeasureCellProvider onMeasureCallback={consumerOnMeasureCb}>
            <Entry
              width={width}
              height={height}
              skin={skin}
              rowOverscan={props.rowOverscan}
              columnOverscan={props.autoCrushNumCols ?? 50}
              renderSubComponent={props.renderSubComponent}
              table={table}
              isMeasuring={true}
              measureCells={measureCells}
              pinColsRelativeTo={props.pinColsRelativeTo}
              pinRowsRelativeTo={props.pinRowsRelativeTo}
              crushMinSizeBy={props.crushMinSizeBy}
              underlay={props.underlay}
              tableContainerRef={tableContainerRef}
            />
          </MeasureCellProvider>
        </div>
      )}
      <Entry
        width={width}
        height={height}
        skin={skin}
        rowOverscan={props.rowOverscan}
        columnOverscan={props.columnOverscan}
        renderSubComponent={props.renderSubComponent}
        table={table}
        isMeasuring={false}
        measureCells={measureCells}
        pinColsRelativeTo={props.pinColsRelativeTo}
        pinRowsRelativeTo={props.pinRowsRelativeTo}
        crushMinSizeBy={props.crushMinSizeBy}
        underlay={props.underlay}
        tableContainerRef={tableContainerRef}
      />
    </div>
  );
};

function Entry({
  width,
  height,
  skin,
  rowOverscan,
  columnOverscan,
  renderSubComponent,
  table,
  isMeasuring,
  measureCells,
  pinColsRelativeTo,
  pinRowsRelativeTo,
  crushMinSizeBy,
  underlay,
  tableContainerRef,
}: {
  width: number;
  height: number;
  skin: Skin;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (args: { row: Row<any> }) => React.ReactNode;
  table: Table<any>;
  isMeasuring: boolean;
  measureCells: (cb: (measureData: MeasureData) => void) => void;
  pinColsRelativeTo?: "cols" | "table";
  pinRowsRelativeTo?: "rows" | "table";
  crushMinSizeBy?: "header" | "cell" | "both";
  underlay?: React.ReactNode;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const placeHolderContainerRefWhileMeasuring =
    React.useRef<HTMLDivElement | null>(null);
  return (
    <TableContext.Provider
      value={React.useMemo(
        () => ({
          width,
          height,
          tableContainerRef: isMeasuring
            ? placeHolderContainerRefWhileMeasuring
            : tableContainerRef,
          table,
          skin,
          config: {
            rowOverscan: rowOverscan ?? 10,
            columnOverscan: columnOverscan ?? 3,
          },
          renderSubComponent: renderSubComponent,
          measureCells,
          pinColsRelativeTo: pinColsRelativeTo ?? "cols",
          pinRowsRelativeTo: pinRowsRelativeTo ?? "rows",
          crushMinSizeBy: crushMinSizeBy ?? "header",
        }),
        [
          width,
          height,
          isMeasuring,
          tableContainerRef,
          table,
          skin,
          rowOverscan,
          columnOverscan,
          renderSubComponent,
          measureCells,
          pinColsRelativeTo,
          pinRowsRelativeTo,
          crushMinSizeBy,
        ],
      )}
    >
      <ColProvider>
        <VirtualRowProvider>
          <Body underlay={underlay} isMeasuring={isMeasuring} />
        </VirtualRowProvider>
      </ColProvider>
    </TableContext.Provider>
  );
}

function Body({
  underlay,
  isMeasuring,
}: {
  underlay?: React.ReactNode;
  isMeasuring: boolean;
}) {
  const { skin, pinColsRelativeTo, crushMinSizeBy } = useTableContext();
  const { rows, offsetBottom, offsetTop } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  const content = () => {
    let tableHeader: React.ReactNode | undefined;
    let tableBody: React.ReactNode | undefined;
    let tableFooter: React.ReactNode | undefined;

    if (
      headerGroups.length > 0 &&
      (!isMeasuring || crushMinSizeBy !== "cell")
    ) {
      tableHeader = (
        <skin.TableHeader>
          {headerGroups.map((headerGroup) => {
            return (
              <HeaderGroup
                key={headerGroup.id}
                {...headerGroup}
                type="header"
              />
            );
          })}
        </skin.TableHeader>
      );
    }

    if (
      footerGroups.length > 0 &&
      (!isMeasuring || crushMinSizeBy !== "cell")
    ) {
      tableFooter = (
        <skin.TableFooter>
          {footerGroups.map((footerGroup) => {
            return (
              <HeaderGroup
                key={footerGroup.id}
                {...footerGroup}
                type="footer"
              />
            );
          })}
        </skin.TableFooter>
      );
    }

    if (rows.length > 0 && (!isMeasuring || crushMinSizeBy !== "header")) {
      tableBody = (
        <TableBody
          rows={rows}
          offsetBottom={offsetBottom}
          offsetTop={offsetTop}
        ></TableBody>
      );
    }

    return (
      <>
        {tableHeader}
        {tableBody}
        {tableFooter}
      </>
    );
  };

  return (
    <skin.OverlayContainer>
      <skin.OuterContainer>
        {underlay}

        <skin.TableScroller />

        {/* Regular content */}
        {content()}

        {skin.PinnedColsOverlay && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width:
                pinColsRelativeTo === "table"
                  ? "max(var(--table-width), 100%)"
                  : "var(--table-width)",
              height:
                "max(var(--table-height) + var(--header-height) + var(--footer-height), 100%)",
              backgroundColor: "transparent",
              zIndex: 1000,
              display: "flex",
              pointerEvents: "none",
            }}
          >
            <skin.PinnedColsOverlay position="left" />
            <div style={{ flex: 1 }}></div>
            <skin.PinnedColsOverlay position="right" />
          </div>
        )}
      </skin.OuterContainer>
    </skin.OverlayContainer>
  );
}
