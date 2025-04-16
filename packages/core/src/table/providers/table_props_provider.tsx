import { Table } from "@tanstack/react-table";
import React from "react";
import {
  Dependency,
  GetDependency,
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
    const getSet = <T extends Dependency["type"]>(
      _: T,
    ): Set<{
      callback: (table: Table<any>, rerender: boolean) => void;
      dependency: GetDependency<T>;
    }> => new Set();

    const updateListeners: UpdateListeners = {
      table: getSet("table"),
      row_offsets: getSet("row_offsets"),
      col_offsets: getSet("col_offsets"),

      col_offsets_main: getSet("col_offsets_main"),
      col_visible_range_main: getSet("col_visible_range_main"),

      col_visible_range: getSet("col_visible_range"),
      row_visible_range: getSet("row_visible_range"),
    };

    let initialTable: Table<any> | null = null;

    const triggerUpdate = (dependency: Dependency, rerender: boolean) => {
      const tbl = initialTable;
      if (!tbl) {
        throw new Error("initialTable is not set");
      }
      updateListeners[dependency.type].forEach((listener) => {
        if (
          (dependency.type === "col_offsets" &&
            listener.dependency.type === "col_offsets") ||
          (dependency.type === "col_visible_range" &&
            listener.dependency.type === "col_visible_range")
        ) {
          if (dependency.groupType !== listener.dependency.groupType) {
            return;
          }
          if (dependency.groupId !== listener.dependency.groupId) {
            return;
          }
        }
        if (dependency.type !== listener.dependency.type) {
          return;
        }

        try {
          listener.callback(tbl, rerender);
        } catch (err) {
          // ignore errors
        }
      });
    };
    return {
      triggerUpdate,
      updateTable: (table: Table<any>, rerender: boolean) => {
        initialTable = table;
        triggerUpdate({ type: "table" }, rerender);
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
