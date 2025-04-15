import { Column, Row, RowData, Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { MeasureCellProvider } from "../measure_cell_provider";
import { Skin } from "../skin";
import { getSubHeaders } from "../utils";
import { ColVirtualizerProvider } from "./cols/col_virtualizer_provider";
import { HeaderGroup } from "./cols/header_group";
import { useColVirtualizer } from "./hooks/use_col_virtualizer";
import { useRowVirtualizer } from "./hooks/use_row_virtualizer";
import { useTableProps } from "./hooks/use_table_props";
import { useTablePropsContext } from "./hooks/use_table_props_context";
import { useTableRef } from "./hooks/use_table_ref";
import { TablePropsProvider } from "./providers/table_props_provider";
import { VirtualRowProvider } from "./rows/virtual_row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { CellRefs, MeasureData, RttuiRef, ShouldUpdate } from "./types";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    autoCrush?: boolean;
    fillAvailableSpaceAfterCrush?: boolean;
    crushMinSizeBy?: "header" | "cell" | "both";
  }
}

type ReactTanstackTableUiProps<T> = {
  table: Table<T>;
  rowDndHandler?: RowDndHandler<T>;
  colDndHandler?: ColDndHandler<T>;
  skin?: Skin;
  width?: number;
  height?: number;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (row: Row<T>) => React.ReactNode;
  underlay?: React.ReactNode;
  autoCrushColumns?: boolean;
  pinColsRelativeTo?: "cols" | "table";
  pinRowsRelativeTo?: "rows" | "table";
  crushMinSizeBy?: "header" | "cell" | "both";
  fillAvailableSpaceAfterCrush?: boolean;
  scrollbarWidth?: number;
  tableRef?: React.RefObject<RttuiRef | undefined>;
  autoCrushNumCols?: number;
  shouldUpdate?: ShouldUpdate;
};

type ShallowEqualCompatibleProps = ReactTanstackTableUiProps<any> & {
  entryRefs: React.RefObject<{ shouldUpdate?: ShouldUpdate }>;
};

export const ReactTanstackTableUi = function ReactTanstackTableUi<T>(
  props: ReactTanstackTableUiProps<T>,
) {
  return (
    <TablePropsProvider>
      <TablePropsProviderWrapper {...props} />
    </TablePropsProvider>
  );
};

function TablePropsProviderWrapper(props: ReactTanstackTableUiProps<any>) {
  const { table } = props;

  const context = useTablePropsContext();
  const { triggerTableUpdate } = context;
  // validate props
  if (table.getIsSomeColumnsPinned() && !table.options.enableColumnPinning) {
    throw new Error(
      "column pinning will not work unless enableColumnPinning is set to true",
    );
  }

  // update the useTableProps hooks when the table state changes
  triggerTableUpdate(props.table, false);
  React.useLayoutEffect(() => {
    triggerTableUpdate(props.table, true);
  });

  const entryRefOb = {
    shouldUpdate: props.shouldUpdate,
  };

  const entryRefs = React.useRef(entryRefOb);
  entryRefs.current = entryRefOb;

  const shallowEqualCompatibleProps: ShallowEqualCompatibleProps = {
    ...props,
    shouldUpdate: undefined,
    entryRefs,
  };

  // tanstack table causes a re-render when its state changes
  // but we don't want <ReactTanstackTableUi /> to update just because the parent updates, only if the table state changes
  // or one of the other ReactTanstackTableUiProps changes
  // we trigger updates to the useTableProps hooks when the table state changes so it can re-render if the data the particular useTableProps hook depends on changes
  return <PropGuard {...shallowEqualCompatibleProps} />;
}

const PropGuard = React.memo(function PropGuard(
  props: ShallowEqualCompatibleProps,
) {
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

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

  const { width, rowCount, numHeaders, numFooters } = useTableProps((table) => {
    const width = props.width ?? table.getTotalSize();
    const headerGroups = table.getHeaderGroups();
    const footerGroups = table.getFooterGroups();
    const numHeaders = headerGroups.filter((group) =>
      group.headers.some((header) => header.column.columnDef.header),
    ).length;
    const numFooters = footerGroups.filter((group) =>
      group.headers.some((header) => header.column.columnDef.footer),
    ).length;
    const rowCount = table.getRowCount();
    return { width, rowCount, numHeaders, numFooters };
  });

  const height =
    props.height ??
    skin.headerRowHeight * numHeaders +
      skin.footerRowHeight * numFooters +
      skin.rowHeight * rowCount;

  const refsValue = {
    props,
    crushMinSizeBy,
    width,
    height,
  };

  const tableRef = useTableRef();

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
      tableRef.current.setColumnSizing((prev) => {
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
          const tsCol = tableRef.current.getColumn(colId);
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
          const tsCol = tableRef.current.getColumn(colId);
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
                const headerInstance = header();
                const crushMinSizeBy = getCrushMinSizeBy(headerInstance.column);
                if (crushMinSizeBy === "cell") {
                  return;
                }
                const headerWidth = contrainSize(
                  newSizing[colId],
                  headerInstance.column,
                );
                let leafTotal = 0;
                const leafs = getSubHeaders(headerInstance);
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
    [contrainSize, tableRef],
  );

  const fillAvailableSpaceAfterCrush = React.useCallback(
    (cols: MeasureData["cols"]) => {
      tableRef.current.setColumnSizing((prev) => {
        const newSizing = { ...prev };

        //#region fill available space after crush
        const totalWidth =
          refs.current.width - (refs.current.props.scrollbarWidth ?? 0);

        const leafCols = new Set<string>();
        cols.forEach((_, colId) => {
          const tsCol = tableRef.current.getColumn(colId);
          if (tsCol) {
            tsCol.getLeafColumns().forEach((leafCol) => {
              leafCols.add(leafCol.id);
            });
          }
        });
        let colAccumWidth = 0;
        const colsThatCanFill = new Set<Column<any, unknown>>();

        const getSize = (colId: string, col?: Column<any, unknown>) => {
          return (
            newSizing[colId] ??
            col?.getSize() ??
            refs.current.props.table.options.defaultColumn?.size ??
            0
          );
        };

        let fixedWidth = 0;
        leafCols.forEach((colId) => {
          const tsCol = tableRef.current.getColumn(colId);
          const colSize = contrainSize(getSize(colId, tsCol), tsCol);
          if (
            tsCol &&
            tsCol?.columnDef.meta?.fillAvailableSpaceAfterCrush !== false
          ) {
            colAccumWidth += colSize;
            colsThatCanFill.add(tsCol);
          } else {
            fixedWidth += colSize;
          }
        });
        console.log(
          Array.from(cols.values()).flatMap((col) =>
            col ? Object.values(col).map((entry) => entry) : [],
          ),
        );
        if (
          refs.current.props.fillAvailableSpaceAfterCrush &&
          colAccumWidth < totalWidth - fixedWidth
        ) {
          let totalWhenColsAreConstrained = 0;
          const nonConstrainedCols = new Set<Column<any, unknown>>();
          const delta = totalWidth - fixedWidth - colAccumWidth;
          const perColumnDelta = delta / colsThatCanFill.size;
          // step 1, expand each col that doesn't have fillAvailableSpaceAfterCrush set to false
          colsThatCanFill.forEach((col) => {
            const newSize = getSize(col.id, col) + perColumnDelta;
            newSizing[col.id] = contrainSize(newSize, col);
            totalWhenColsAreConstrained += newSizing[col.id];
            if (newSize === newSizing[col.id]) {
              // these are cols without a maxSize
              nonConstrainedCols.add(col);
            }
          });
          // step 2, if columns have a maxSize, then we need a second pass to expand the cols that don't have a maxSize
          if (totalWhenColsAreConstrained < totalWidth - fixedWidth) {
            const diff = totalWidth - fixedWidth - totalWhenColsAreConstrained;
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
    [contrainSize, tableRef],
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

  const loading = Boolean(consumerOnMeasureCb);

  const entryProps: EntryProps = {
    width,
    height,
    skin,
    rowOverscan: props.rowOverscan,
    columnOverscan: props.columnOverscan,
    renderSubComponent: props.renderSubComponent,
    isMeasuring: false,
    loading,
    measureCells,
    pinColsRelativeTo: props.pinColsRelativeTo,
    pinRowsRelativeTo: props.pinRowsRelativeTo,
    crushMinSizeBy: props.crushMinSizeBy,
    underlay: props.underlay,
    tableContainerRef: tableContainerRef,
    refs: props.entryRefs,
  };

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
              {...entryProps}
              columnOverscan={props.autoCrushNumCols ?? 50}
              renderSubComponent={props.renderSubComponent}
              isMeasuring={true}
              loading={false}
            />
          </MeasureCellProvider>
        </div>
      )}
      <Entry {...entryProps} />
    </div>
  );
});

type EntryProps = {
  width: number;
  height: number;
  skin: Skin;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (row: Row<any>) => React.ReactNode;
  isMeasuring: boolean;
  measureCells: (cb: (measureData: MeasureData) => void) => void;
  pinColsRelativeTo?: "cols" | "table";
  pinRowsRelativeTo?: "rows" | "table";
  crushMinSizeBy?: "header" | "cell" | "both";
  underlay?: React.ReactNode;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  refs: React.RefObject<{ shouldUpdate?: ShouldUpdate }>;
  loading: boolean;
};

const Entry = function Entry({
  width,
  height,
  skin,
  rowOverscan,
  columnOverscan,
  renderSubComponent,
  isMeasuring,
  measureCells,
  pinColsRelativeTo,
  pinRowsRelativeTo,
  crushMinSizeBy,
  underlay,
  tableContainerRef,
  refs,
  loading,
}: EntryProps) {
  const placeHolderContainerRefWhileMeasuring =
    React.useRef<HTMLDivElement | null>(null);

  return (
    <TableContext.Provider
      value={React.useMemo(() => {
        return {
          width,
          height,
          tableContainerRef: isMeasuring
            ? placeHolderContainerRefWhileMeasuring
            : tableContainerRef,
          skin,
          config: {
            rowOverscan: rowOverscan ?? 10,
            columnOverscan: columnOverscan ?? 3,
          },
          renderSubComponent,
          measureCells,
          pinColsRelativeTo: pinColsRelativeTo ?? "cols",
          pinRowsRelativeTo: pinRowsRelativeTo ?? "rows",
          crushMinSizeBy: crushMinSizeBy ?? "header",
          refs,
          loading,
        };
      }, [
        width,
        height,
        isMeasuring,
        tableContainerRef,
        skin,
        rowOverscan,
        columnOverscan,
        renderSubComponent,
        measureCells,
        pinColsRelativeTo,
        pinRowsRelativeTo,
        crushMinSizeBy,
        refs,
        loading,
      ])}
    >
      <ColVirtualizerProvider>
        <VirtualRowProvider>
          <Body underlay={underlay} isMeasuring={isMeasuring} />
        </VirtualRowProvider>
      </ColVirtualizerProvider>
    </TableContext.Provider>
  );
};

const Body = React.memo(function Body({
  underlay,
  isMeasuring,
}: {
  underlay?: React.ReactNode;
  isMeasuring: boolean;
}) {
  const { skin, pinColsRelativeTo } = useTableContext();

  return (
    <skin.OverlayContainer>
      <skin.OuterContainer>
        {underlay}

        <skin.TableScroller />

        {/* Regular content */}
        <Content isMeasuring={isMeasuring} />

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
});

const Content = React.memo(function Content({
  isMeasuring,
}: {
  isMeasuring: boolean;
}) {
  const { skin, crushMinSizeBy } = useTableContext();
  const { rows, offsetBottom, offsetTop, offsetLeft, offsetRight } =
    useRowVirtualizer();
  const { footerGroups, headerGroups } = useColVirtualizer();

  let tableHeader: React.ReactNode | undefined;
  let tableBody: React.ReactNode | undefined;
  let tableFooter: React.ReactNode | undefined;

  if (headerGroups.length > 0 && (!isMeasuring || crushMinSizeBy !== "cell")) {
    tableHeader = (
      <skin.TableHeader>
        {headerGroups.map((headerGroup) => {
          return (
            <HeaderGroup key={headerGroup.id} {...headerGroup} type="header" />
          );
        })}
      </skin.TableHeader>
    );
  }

  if (footerGroups.length > 0 && (!isMeasuring || crushMinSizeBy !== "cell")) {
    tableFooter = (
      <skin.TableFooter>
        {footerGroups.map((footerGroup) => {
          return (
            <HeaderGroup key={footerGroup.id} {...footerGroup} type="footer" />
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
        offsetLeft={offsetLeft}
        offsetRight={offsetRight}
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
});
