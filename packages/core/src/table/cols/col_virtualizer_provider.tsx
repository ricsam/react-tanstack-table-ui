import { HeaderGroup } from "@tanstack/react-table";
import React from "react";
import { ColVirtualizerContext } from "../contexts/col_virtualizer_context";
import { useTableProps } from "../hooks/use_table_props";
import { useTriggerTablePropsUpdate } from "../hooks/use_trigger_table_props_update";
import { CombinedHeaderGroup, VirtualHeaderGroup } from "../types";
import { ColVirtualizerType } from "./col_virtualizer_type";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";
import { HeaderIndex } from "./virtual_header/types";

const combineHeaderGroups = (
  groups: HeaderGroup<any>[][],
  type: "header" | "footer",
): {
  filteredHeaderGroups: CombinedHeaderGroup[];
  headerIndices: Record<string, undefined | HeaderIndex[]>;
} => {
  const numGroups = Math.max(...groups.map((group) => group.length));
  const combinedGroups: CombinedHeaderGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    combinedGroups[i] = {
      id: groups.map((group) => group[i].id).join(""),
      headers: groups.flatMap((group) => {
        return group[i].headers;
      }),
    };
  }

  const headerIndices: Record<string, undefined | HeaderIndex[]> = {};
  const filteredHeaderGroups: CombinedHeaderGroup[] = [];

  combinedGroups.forEach((group) => {
    let hasVisibleHeader = false;
    const groupHeaderIndices: Record<string, HeaderIndex[]> = {};
    group.headers.forEach((header, j) => {
      if (!groupHeaderIndices[header.column.id]) {
        groupHeaderIndices[header.column.id] = [];
      }
      groupHeaderIndices[header.column.id].push({
        headerIndex: j,
        groupIndex: filteredHeaderGroups.length,
        columnId: header.column.id,
        headerId: header.id,
        header,
      });
      if (header.column.columnDef[type]) {
        hasVisibleHeader = true;
      }
    });
    if (hasVisibleHeader) {
      filteredHeaderGroups.push(group);
      Object.assign(headerIndices, groupHeaderIndices);
    }
  });
  return {
    filteredHeaderGroups,
    headerIndices,
  };
};

const useHeaderGroups = (type: "header" | "footer") => {
  const { leftHeaderGroups, centerHeaderGroups, rightHeaderGroups } =
    useTableProps((table) => {
      const [leftHeaderGroups, centerHeaderGroups, rightHeaderGroups] =
        type === "header"
          ? [
              table.getLeftHeaderGroups(),
              table.getCenterHeaderGroups(),
              table.getRightHeaderGroups(),
            ]
          : [
              table.getLeftFooterGroups(),
              table.getCenterFooterGroups(),
              table.getRightFooterGroups(),
            ];
      return {
        leftHeaderGroups,
        centerHeaderGroups,
        rightHeaderGroups,
      };
    });
  const headerGroups = React.useMemo(() => {
    const combined = combineHeaderGroups(
      [leftHeaderGroups, centerHeaderGroups, rightHeaderGroups],
      type,
    );

    return combined;
  }, [centerHeaderGroups, leftHeaderGroups, rightHeaderGroups, type]);

  const headerGroupsRef = React.useRef(headerGroups);
  headerGroupsRef.current = headerGroups;

  const getHeaderGroups = useHeaderGroupVirtualizers(
    React.useMemo(
      () => ({
        headerGroupsRef,
        type,
      }),
      [type],
    ),
  );

  return getHeaderGroups;
};

export const ColVirtualizerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // we need to trigger a re-render the virtualizer when the table instance updates
  useTableProps(() => ({}), {
    dependencies: ["table"],
    arePropsEqual: () => false,
  });

  const getHeaderGroups = useHeaderGroups("header");
  const getFooterGroups = useHeaderGroups("footer");

  const getMainHeaderGroup: () => VirtualHeaderGroup = () => {
    const headerGroups = getHeaderGroups();
    const mainHeaderGroup =
      headerGroups[headerGroups.length - 1] ?? getFooterGroups()[0];
    if (!mainHeaderGroup) {
      throw new Error("Implement me using the body virtualizer");
    }
    return mainHeaderGroup;
  };

  useTriggerTablePropsUpdate(
    `col_visible_range_main`,
    getMainHeaderGroup()
      .getVirtualizer()
      .getVirtualItems()
      .map((vi) => vi.index)
      .join(","),
  );

  // const firstRow = table.getRowModel().rows[0].getVisibleCells();
  // const bodyVirtualizer = useVirtualizer({
  //   count: firstRow.length,
  //   getScrollElement: () => tableContainerRef.current,
  //   estimateSize: (index) => firstRow[index].column.getSize(),
  //   getItemKey(index) {
  //     return (
  //       mainHeaderGroup?.headerGroup.headers[index].id ??
  //       firstRow[index].column.id
  //     );
  //   },
  //   horizontal: true,
  // });

  const initialRefs = {
    getHeaderGroups,
    getFooterGroups,
    getMainHeaderGroup,
  };
  const refs = React.useRef(initialRefs);
  refs.current = initialRefs;

  useTriggerTablePropsUpdate("col_offsets");

  return (
    <ColVirtualizerContext.Provider
      value={React.useMemo(
        (): ColVirtualizerType => ({
          getHeaderGroups: () => refs.current.getHeaderGroups(),
          getFooterGroups: () => refs.current.getFooterGroups(),
          getMainHeaderGroup: () => refs.current.getMainHeaderGroup(),
        }),
        [],
      )}
    >
      {children}
    </ColVirtualizerContext.Provider>
  );
};
