import { Table } from "@tanstack/react-table";
import React from "react";
import { Skin } from "../skin";
type TableContextType = {
  width: number;
  height: number;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  table: Table<any>;
  skin: Skin;
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
