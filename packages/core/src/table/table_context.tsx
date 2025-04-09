import { Row, Table } from "@tanstack/react-table";
import React from "react";
import { Skin } from "../skin";
import { MeasureData } from "./types";

type TableConfig = {
  columnOverscan: number;
  rowOverscan: number;
};

type TableContextType = {
  width: number;
  height: number;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  table: Table<any>;
  skin: Skin;
  config: TableConfig;
  renderSubComponent?: (args: { row: Row<any> }) => React.ReactNode;
  measureCells: (cb: (measureData: MeasureData) => void) => void;
  pinColsRelativeTo: "cols" | "table";
  pinRowsRelativeTo: "rows" | "table";
  crushMinSizeBy: "header" | "cell" | "both";
};

export const TableContext = React.createContext<TableContextType | undefined>(
  undefined,
);

export const useTableContext = () => {
  const context = React.useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};
