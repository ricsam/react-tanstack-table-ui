import { Row, RowData, Table } from "@tanstack/react-table";
import React from "react";
import { defaultSkin } from "../default_skin/default_skin";
import { ColDndHandler, RowDndHandler } from "../dnd_handler";
import { MeasureCellProvider } from "../measure_cell_provider";
import { Skin } from "../skin";
import { useColContext } from "./cols/col_context";
import { ColProvider } from "./cols/col_provider";
import { HeaderGroup } from "./cols/header_group";
import { useVirtualRowContext } from "./rows/virtual_row_context";
import { VirtualRowProvider } from "./rows/virtual_row_provider";
import { TableBody } from "./table_body";
import { TableContext, useTableContext } from "./table_context";
import { CellRefs, MeasureData, RttuiRef } from "./types";
import { getSubHeaders } from "../utils";

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
  width: number;
  height: number;
  rowOverscan?: number;
  columnOverscan?: number;
  renderSubComponent?: (args: { row: Row<T> }) => React.ReactNode;
  underlay?: React.ReactNode;
  autoCrushColumns?: boolean;
  disableScroll?: boolean;
  pinColsRelativeTo?: "cols" | "table";
  pinRowsRelativeTo?: "rows" | "table";
  crushMinSizeBy?: "header" | "cell" | "both";
  fillAvailableSpaceAfterCrush?: boolean;
  scrollbarWidth?: number;
  tableRef?: React.RefObject<RttuiRef>;
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

  const refsValue = {
    table,
    props,
    crushMinSizeBy,
  };
  const refs = React.useRef(refsValue);
  refs.current = refsValue;

  const onMeasureCb = React.useCallback(({ cols }: MeasureData) => {
    refs.current.table.setColumnSizing((prev) => {
      const newSizing = { ...prev };

      const colsToCrush = new Map<string, CellRefs>();

      cols.forEach((col, colId) => {
        if (!col) {
          return;
        }
        const tsCol = refs.current.table.getColumn(colId);
        if (tsCol?.columnDef.meta?.autoCrush !== false) {
          colsToCrush.set(colId, col);
        }
      });

      colsToCrush.forEach((col, colId) => {
        const tsCol = refs.current.table.getColumn(colId);
        const crushMinSizeBy =
          tsCol?.columnDef.meta?.crushMinSizeBy ?? refs.current.crushMinSizeBy;
        const colWidth = Math.max(
          ...Object.values(col)
            .filter(({ type }) => {
              if (crushMinSizeBy === "both") {
                return true;
              }
              return type === crushMinSizeBy;
            })
            .map(({ rect }) => rect.width),
        );
        newSizing[colId] = colWidth;
      });

      //#region size by largest header
      // maybe add one more option to crushMinSizeBy to size by largest header, but for now it is enabled by default
      colsToCrush.forEach((col, colId) => {
        Object.values(col).forEach((cell) => {
          if (cell.type === "header") {
            const header = cell.header;
            if (header) {
              const crushMinSizeBy =
                header.column.columnDef.meta?.crushMinSizeBy ??
                refs.current.crushMinSizeBy;
              if (crushMinSizeBy === "cell") {
                return;
              }
              const headerWidth = newSizing[colId];
              let leafTotal = 0;
              const leafs = getSubHeaders(header);
              leafs.forEach((h) => {
                leafTotal += newSizing[h.column.id];
              });

              if (leafTotal < headerWidth) {
                const diff = headerWidth - leafTotal;
                const perCol = diff / leafs.length;
                leafs.forEach((h) => {
                  newSizing[h.column.id] = newSizing[h.column.id] + perCol;
                });
              }
            }
          }
        });
      });

      //#endregion
      const totalWidth =
        refs.current.props.width - (refs.current.props.scrollbarWidth ?? 0);

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
      const colsThatCanFill = new Set<string>();

      leafCols.forEach((colId) => {
        totalSize += newSizing[colId];
        const tsCol = refs.current.table.getColumn(colId);
        if (tsCol?.columnDef.meta?.fillAvailableSpaceAfterCrush !== false) {
          colsThatCanFill.add(colId);
        }
      });
      if (
        refs.current.props.fillAvailableSpaceAfterCrush &&
        totalSize < totalWidth
      ) {
        const delta = totalWidth - totalSize;
        const perColumnDelta = delta / colsThatCanFill.size;
        colsThatCanFill.forEach((colId) => {
          newSizing[colId] += perColumnDelta;
        });
      }
      return newSizing;
    });
  }, []);

  const autoSizeColumns = React.useCallback(() => {
    measureCells(onMeasureCb);
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
    <TableContext.Provider
      value={React.useMemo(
        () => ({
          width: props.width,
          height: props.height,
          tableContainerRef: tableContainerRef,
          table,
          skin: props.skin ?? defaultSkin,
          config: {
            rowOverscan: props.rowOverscan ?? 10,
            columnOverscan: props.columnOverscan ?? 3,
          },
          renderSubComponent: props.renderSubComponent,
          onMeasureCallback: consumerOnMeasureCb,
          measureCells,
          disableScroll: props.disableScroll,
          pinColsRelativeTo: props.pinColsRelativeTo ?? "cols",
          pinRowsRelativeTo: props.pinRowsRelativeTo ?? "rows",
          crushMinSizeBy,
        }),
        [
          props.width,
          props.height,
          props.skin,
          props.rowOverscan,
          props.columnOverscan,
          props.renderSubComponent,
          table,
          consumerOnMeasureCb,
          measureCells,
          props.disableScroll,
          props.pinColsRelativeTo,
          props.pinRowsRelativeTo,
          crushMinSizeBy,
        ],
      )}
    >
      <ColProvider>
        <VirtualRowProvider>
          <Body underlay={props.underlay} />
        </VirtualRowProvider>
      </ColProvider>
    </TableContext.Provider>
  );
};

function Body({ underlay }: { underlay?: React.ReactNode }) {
  const { skin, onMeasureCallback, pinColsRelativeTo } = useTableContext();
  const { rows, offsetBottom, offsetTop } = useVirtualRowContext();
  const { footerGroups, headerGroups } = useColContext();

  const content = (
    <>
      {headerGroups.length > 0 && (
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
      )}
      <TableBody
        rows={rows}
        offsetBottom={offsetBottom}
        offsetTop={offsetTop}
      ></TableBody>
      {footerGroups.length > 0 && (
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
      )}
    </>
  );

  return (
    <skin.OverlayContainer>
      <skin.OuterContainer>
        {underlay}

        <skin.TableScroller />

        {content}

        {onMeasureCallback && (
          <div
            className="rtui-measure-container"
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
            <MeasureCellProvider onMeasureCallback={onMeasureCallback}>
              {content}
            </MeasureCellProvider>
          </div>
        )}

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
