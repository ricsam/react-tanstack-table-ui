import { createContext, useContext } from "react";
import { Cell, Header } from "@tanstack/react-table";
import { CellRefs } from "./table/types";

export type MeasuredCell =
  | {
      type: "cell";
      id: string; // cellId
      columnId: string;
      cell: Cell<any, any>;
    }
  | {
      type: "header";
      id: string; // headerId
      columnId: string;
      header?: Header<any, any>;
    };

export const MeasureCellContext = createContext<
  | undefined
  | {
      storeRef: (el: HTMLDivElement | null, measuredCell: MeasuredCell) => void;
      getEls: () => CellRefs;
      registerCell: (cellId: string) => void;
    }
>(undefined);

export const useMeasureCellContext = () => {
  const context = useContext(MeasureCellContext);
  return context;
};
