import { Cell } from "@tanstack/react-table";
import React from "react";
import { MeasureCellContext } from "./measure_cell_context";
import { CellRefs } from "./table/types";
import { MeasureData } from "./table/types";

export const MeasureCellProvider = ({
  children,
  onMeasureCallback,
}: {
  children: React.ReactNode;
  onMeasureCallback: (measureData: MeasureData) => void;
}) => {
  const elRefs = React.useRef<CellRefs>({});
  const cellRefs = React.useRef<Set<string>>(new Set());
  const colRefs = React.useRef<Map<string, CellRefs[string][] | undefined>>(
    new Map(),
  );
  const measuredCount = React.useRef(0);
  const registerCell = (cellId: string) => {
    if (!cellRefs.current.has(cellId)) {
      cellRefs.current.add(cellId);
      measuredCount.current++;
    }
  };

  const storeRef = React.useCallback(
    (el: HTMLDivElement | null, cell: Cell<any, any>) => {
      if (!cellRefs.current.has(cell.id)) {
        throw new Error(`Cell ${cell.id} not registered`);
      }
      if (!el) {
        return;
      }
      elRefs.current[cell.id] = { el, cell, rect: el.getBoundingClientRect() };
      const currentCol = colRefs.current.get(cell.column.id);
      if (!currentCol) {
        colRefs.current.set(cell.column.id, [elRefs.current[cell.id]]);
      } else {
        currentCol.push(elRefs.current[cell.id]);
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
