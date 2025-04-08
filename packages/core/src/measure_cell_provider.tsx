import React from "react";
import { MeasureCellContext, MeasuredCell } from "./measure_cell_context";
import { CellRefs, MeasureData } from "./table/types";

export const MeasureCellProvider = ({
  children,
  onMeasureCallback,
}: {
  children: React.ReactNode;
  onMeasureCallback: (measureData: MeasureData) => void;
}) => {
  const elRefs = React.useRef<CellRefs>({});
  const cellRefs = React.useRef<Set<string>>(new Set());
  const colRefs = React.useRef<Map<string, CellRefs | undefined>>(new Map());
  const measuredCount = React.useRef(0);
  const registerCell = (cellId: string) => {
    if (!cellRefs.current.has(cellId)) {
      cellRefs.current.add(cellId);
      measuredCount.current++;
    }
  };

  const storeRef = React.useCallback(
    (
      el: HTMLDivElement | null,
      measuredCell: MeasuredCell,
    ) => {
      if (!cellRefs.current.has(measuredCell.id)) {
        throw new Error(`Cell ${measuredCell.id} not registered`);
      }
      if (!el) {
        return;
      }
      elRefs.current[measuredCell.id] = {
        ...measuredCell,
        rect: el.getBoundingClientRect(),
        el,
      };
      const currentCol = colRefs.current.get(measuredCell.columnId);
      if (!currentCol) {
        colRefs.current.set(measuredCell.columnId, {
          [measuredCell.id]: elRefs.current[measuredCell.id],
        });
      } else {
        currentCol[measuredCell.id] = elRefs.current[measuredCell.id];
      }
      measuredCount.current--;
      if (measuredCount.current === 0) {
        onMeasureCallback({
          cells: elRefs.current,
          cols: colRefs.current,
        });
      }
    },
    [onMeasureCallback],
  );
  const getEls = React.useCallback(() => {
    return elRefs.current;
  }, []);
  return (
    <MeasureCellContext.Provider value={{ storeRef, getEls, registerCell }}>
      {children}
    </MeasureCellContext.Provider>
  );
};
