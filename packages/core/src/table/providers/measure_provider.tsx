import { Column } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";
import React, { useCallback, useState } from "react";
import { defaultSkin } from "../../default_skin/default_skin";
import { Skin } from "../../skin";
import { MeasureData, CellRefs, RttuiRef } from "../types";
import { getSubHeaders } from "../../utils";
import { MeasureContext } from "../contexts/measure_context";

export const MeasureProvider = (props: {
  children: React.ReactNode;
  width: number | undefined;
  height: number | undefined;
  crushMinSizeBy: "header" | "cell" | "both" | undefined;
  scrollbarWidth: number | undefined;
  table: Table<any>;
  skin: Skin | undefined;
  fillAvailableSpaceAfterCrush: boolean | undefined;
  autoCrushColumns: boolean | undefined;
  tableRef: React.RefObject<RttuiRef | undefined> | undefined;
}) => {
  const [consumerOnMeasureCb, setOnMeasureCb] = useState<
    undefined | ((measureData: MeasureData) => void)
  >(undefined);

  const measureCells = useCallback(
    (cb: (measureData: MeasureData) => void) =>
      setOnMeasureCb(() => {
        return (measureData: MeasureData) => {
          cb(measureData);
          setOnMeasureCb(undefined);
        };
      }),
    [],
  );

  const getWidth = () => props.width ?? props.table.getTotalSize();
  const getHeight = () => {
    const skin = props.skin ?? defaultSkin;
    const headerGroups = props.table.getHeaderGroups();
    const footerGroups = props.table.getFooterGroups();
    const numHeaders = headerGroups.filter((group) =>
      group.headers.some((header) => header.column.columnDef.header),
    ).length;
    const numFooters = footerGroups.filter((group) =>
      group.headers.some((header) => header.column.columnDef.footer),
    ).length;
    const rowCount = props.table.getRowCount();
    return (
      props.height ??
      skin.headerRowHeight * numHeaders +
        skin.footerRowHeight * numFooters +
        skin.rowHeight * rowCount
    );
  };
  const crushMinSizeBy = props.crushMinSizeBy ?? "header";
  const scrollbarWidth = props.scrollbarWidth ?? 0;

  const width = getWidth();
  const height = getHeight();

  const refsValue = {
    crushMinSizeBy,
    width,
    height,
    table: props.table,
    scrollbarWidth,
    fillAvailableSpaceAfterCrush: props.fillAvailableSpaceAfterCrush ?? false,
    autoCrushColumns: props.autoCrushColumns ?? false,
  };

  const refs = React.useRef(refsValue);
  refs.current = refsValue;

  const contrainSize = React.useCallback((size: number, col?: Column<any>) => {
    const maxSize =
      col?.columnDef?.maxSize ??
      refs.current.table.options.defaultColumn?.maxSize ??
      Number.POSITIVE_INFINITY;
    const minSize =
      col?.columnDef?.minSize ??
      refs.current.table.options.defaultColumn?.minSize ??
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
                  refs.current.table.options.defaultColumn?.size ??
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
    [contrainSize],
  );

  const fillAvailableSpaceAfterCrush = React.useCallback(
    (cols: MeasureData["cols"]) => {
      refs.current.table.setColumnSizing((prev) => {
        const newSizing = { ...prev };

        //#region fill available space after crush
        const totalWidth = refs.current.width - refs.current.scrollbarWidth;

        const leafCols = new Set<string>();
        cols.forEach((_, colId) => {
          const tsCol = refs.current.table.getColumn(colId);
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
            refs.current.table.options.defaultColumn?.size ??
            0
          );
        };

        let fixedWidth = 0;
        leafCols.forEach((colId) => {
          const tsCol = refs.current.table.getColumn(colId);
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

        if (
          refs.current.fillAvailableSpaceAfterCrush &&
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
    if (refs.current.autoCrushColumns) {
      autoSizeColumns();
    }
  }, [autoSizeColumns, refs.current.autoCrushColumns]);

  if (props.tableRef) {
    props.tableRef.current = {
      autoSizeColumns,
    };
  }

  const isMeasuring = Boolean(consumerOnMeasureCb);

  return (
    <MeasureContext.Provider
      value={React.useMemo(
        () => ({
          isMeasuring,
          measureCells,
          isMeasuringInstance: false,
          width,
          height,
          consumerOnMeasureCb,
        }),
        [height, isMeasuring, measureCells, width, consumerOnMeasureCb],
      )}
    >
      {props.children}
    </MeasureContext.Provider>
  );
};
