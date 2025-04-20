import React from "react";
import { MeasureCellContext, MeasuredCell } from "./measure_cell_context";
import { IsMeasuring } from "./table/contexts/measure_context";
import { CellRefs } from "./table/types";

export const MeasureCellProvider = ({
  children,
  isMeasuring,
}: {
  children: React.ReactNode;
  isMeasuring: IsMeasuring;
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

  const isMeasuringRef = React.useRef(isMeasuring);
  isMeasuringRef.current = isMeasuring;

  const storeRef = React.useCallback(
    (el: HTMLDivElement | null, measuredCell: MeasuredCell) => {
      if (!cellRefs.current.has(measuredCell.id)) {
        return; // lingering cell
      }
      if (!el) {
        return;
      }
      if (elRefs.current[measuredCell.id]) {
        return;
      }
      elRefs.current[measuredCell.id] = {
        ...measuredCell,
        width: el.getBoundingClientRect().width,
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
        console.log("@isMeasuringRef.current.callback", isMeasuringRef.current.callback);
        isMeasuringRef.current.callback({
          cells: elRefs.current,
          cols: new Map(colRefs.current),
        });
      }
    },
    [],
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
