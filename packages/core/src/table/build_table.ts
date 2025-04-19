import { Table } from "@tanstack/react-table";
import { RttuiTable, UiProps } from "./types";
import { Virtualizer } from "@tanstack/react-virtual";

export type BuildTableDependencies = {
  table?: Table<any>;
  uiProps?: UiProps;
  rowVirtualizer?: Virtualizer<any, any>;
  horizontalVirtualizers?: {
    footer: {
      [groupIndex: number]: Virtualizer<any, any>;
    };
    header: {
      [groupIndex: number]: Virtualizer<any, any>;
    };
  };
};

export const buildTable = (dependencies: {
  table?: Table<any>;
  uiProps?: UiProps;
  rowVirtualizer?: Virtualizer<any, any>;
  horizontalVirtualizers?: {
    footer: {
      [groupIndex: number]: Virtualizer<any, any>;
    };
    header: {
      [groupIndex: number]: Virtualizer<any, any>;
    };
  };
}): RttuiTable => {
  const { table, uiProps, rowVirtualizer, horizontalVirtualizers } =
    dependencies;

  if (!table) {
    throw new Error("table is required");
  }

  if (!uiProps) {
    throw new Error("uiProps is required");
  }

  if (!rowVirtualizer) {
    throw new Error("rowVirtualizer is required");
  }

  if (!horizontalVirtualizers) {
    throw new Error("horizontalVirtualizers is required");
  }

  return {
    tanstackTable: table,
    uiProps,
    virtualData: {
      body: {
        virtualizer: rowVirtualizer,
        offsetLeft: 0,
        offsetRight: 0,
        offsetTop: 0,
        offsetBottom: 0,
        hasRows: false,
        rowLookup: {},
        cellLookup: {},
        rows: {
          top: [],
          center: [],
          bottom: [],
        },
      },
      header: {
        groups: [],
        groupLookup: {},
        headerLookup: {},
      },
      footer: {
        groups: [],
        groupLookup: {},
        headerLookup: {},
      },
    },
  };
};
