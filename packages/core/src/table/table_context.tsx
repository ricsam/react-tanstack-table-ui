import { Row, Table } from "@tanstack/react-table";
import React from "react";
import { Skin } from "../skin";

type TableConfig = {
  columnOverscan: number;
  rowOverscan: number;
};

type TableContextType = {
  width: number;
  height: number;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  innerContainerSizeRef?: React.RefObject<HTMLDivElement | null>;
  table: Table<any>;
  skin: Skin;
  config: TableConfig;
  renderSubComponent?: (args: { row: Row<any> }) => React.ReactNode;
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
