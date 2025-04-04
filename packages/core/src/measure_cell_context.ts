import { Cell } from "@tanstack/react-table";
import { createContext, useContext } from "react";
import { CellRefs } from "./table/types";

export const MeasureCellContext = createContext<
  | undefined
  | {
      storeRef: (el: HTMLDivElement | null, cell: Cell<any, any>) => void;
      getEls: () => CellRefs;
      registerCell: (cellId: string) => void;
    }
>(undefined);

export const useMeasureCellContext = () => {
  const context = useContext(MeasureCellContext);
  return context;
};
