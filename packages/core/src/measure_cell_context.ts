"use client";
import { Header } from "@tanstack/react-table";
import { createContext, useContext } from "react";
import { CellRefs } from "./table/types";

export type MeasuredCell =
  | {
      type: "cell";
      id: string; // cellId
      columnId: string;
    }
  | {
      type: "header";
      id: string; // headerId
      columnId: string;
      header: () => Header<any, any> | undefined;
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
