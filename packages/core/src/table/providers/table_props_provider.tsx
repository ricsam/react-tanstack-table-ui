import { Table } from "@tanstack/react-table";
import React from "react";
import {
  Dependency,
  TablePropsContext,
  TablePropsContextType,
  UpdateListeners,
} from "../contexts/table_props_context";

export const TablePropsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [contextValue] = React.useState((): TablePropsContextType => {
    const getSet = () =>
      new Set<(table: Table<any>, rerender: boolean) => void>();

    const updateListeners: UpdateListeners = {
      table: getSet(),
      row_offsets: getSet(),
      col_offsets: getSet(),
      col_visible_range_header: getSet(),
      col_visible_range_footer: getSet(),
      col_visible_range_main: getSet(),
      row_visible_range: getSet(),
    };

    let initialTable: Table<any> | null = null;

    const triggerUpdate = (dependency: Dependency, rerender: boolean) => {
      const tbl = initialTable;
      if (!tbl) {
        throw new Error("initialTable is not set");
      }
      updateListeners[dependency].forEach((listener) => {
        try {
          listener(tbl, rerender);
        } catch (err) {
          // ignore errors
        }
      });
    };
    return {
      triggerUpdate,
      updateTable: (table: Table<any>, rerender: boolean) => {
        initialTable = table;
        updateListeners.table.forEach((listener) => {
          try {
            listener(table, rerender);
          } catch (err) {
            // ignore errors
          }
        });
      },
      updateListeners,
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
