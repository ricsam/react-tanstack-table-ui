import { Table } from "@tanstack/react-table";
import { createContext } from "react";

export type TablePropsContextType = {
  tableUpdateListeners: Set<(table: Table<any>, rerender: boolean) => void>;
  triggerTableUpdate: (table: Table<any>, rerender: boolean) => void;
  initialTable: () => Table<any>;
};

export const TablePropsContext = createContext<
  TablePropsContextType | undefined
>(undefined);


