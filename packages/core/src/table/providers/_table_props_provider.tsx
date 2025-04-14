import { Table } from "@tanstack/react-table";
import React from "react";
import { TablePropsContext, TablePropsContextType } from "../contexts/TablePropsContext";

export const TablePropsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contextValue] = React.useState((): TablePropsContextType => {
    const tableUpdateListeners = new Set<
      (table: Table<any>, rerender: boolean) => void
    >();

    let initialTable: Table<any> | null = null;

    const triggerTableUpdate = (table: Table<any>, rerender: boolean) => {
      initialTable = table;
      tableUpdateListeners.forEach((listener) => {
        try {
          listener(table, rerender);
        } catch (err) {
          // ignore errors
        }
      });
    };
    return {
      tableUpdateListeners,
      triggerTableUpdate,
      initialTable: () => {
        if (!initialTable) {
          throw new Error("initialTable is not set");
        }
        return initialTable;
      },
    };
  });

  return (
    <TablePropsContext.Provider value={contextValue}>
      {children}
    </TablePropsContext.Provider>
  );
};
