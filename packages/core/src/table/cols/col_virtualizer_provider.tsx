import { HeaderGroup } from "@tanstack/react-table";
import React from "react";
import { ColVirtualizerContext } from "../contexts/col_virtualizer_context";
import { useTableProps } from "../hooks/use_table_props";
import { useTriggerTablePropsUpdate } from "../hooks/use_trigger_table_props_update";
import { CombinedHeaderGroup, VirtualHeaderGroup } from "../types";
import { ColVirtualizerType } from "./col_virtualizer_type";
import {
  FilteredHeaderGroup,
  useHeaderGroupVirtualizers,
} from "./use_header_group_virtualizers";
import { HeaderIndex } from "./virtual_header/types";

const combineHeaderGroups = (
  groups: HeaderGroup<any>[][],
  type: "header" | "footer",
): FilteredHeaderGroup => {
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
  const headerGroupIndices: Record<
    string,
    { groupIndex: number; headerIndices: Record<string, number> }
  > = {};

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
        groupId: group.id,
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
  filteredHeaderGroups.forEach((group, i) => {
    const headerIndices: Record<string, number> = {};
    group.headers.forEach((header, j) => {
      headerIndices[header.id] = j;
    });
    headerGroupIndices[group.id] = {
      groupIndex: i,
      headerIndices,
    };
  });
  return {
    filteredHeaderGroups,
    headerIndices,
    headerGroupIndices,
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
      .getHeaders()
      .map((vi) => vi.id)
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

  const getMainHeaderIndices = (): Record<string, number> => {
    const mainHeaderGroup = getMainHeaderGroup();
    const headerIndices: Record<string, number> = {};
    mainHeaderGroup.getHeaders().forEach((header) => {
      headerIndices[header.id] = header.getIndex();
    });
    return headerIndices;
  };

  const initialRefs = {
    getHeaderGroups,
    getFooterGroups,
    getMainHeaderGroup,
    getMainHeaderIndices,
  };
  const refs = React.useRef(initialRefs);
  refs.current = initialRefs;

  let offsetsCacheKey = "";
  [getHeaderGroups, getFooterGroups].forEach((getGroups) => {
    getGroups().forEach((group) => {
      const { offsetLeft, offsetRight } = group.getOffsets();
      offsetsCacheKey += `${offsetLeft},${offsetRight}`;
    });
  });
  useTriggerTablePropsUpdate("col_offsets", offsetsCacheKey);

  return (
    <ColVirtualizerContext.Provider
      value={React.useMemo(
        (): ColVirtualizerType => ({
          getHeaderGroups: () => refs.current.getHeaderGroups(),
          getFooterGroups: () => refs.current.getFooterGroups(),
          getMainHeaderGroup: () => refs.current.getMainHeaderGroup(),
          getMainHeaderIndices: () => refs.current.getMainHeaderIndices(),
        }),
        [],
      )}
    >
      {children}
    </ColVirtualizerContext.Provider>
  );
};
