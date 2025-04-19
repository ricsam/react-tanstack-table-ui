import { HeaderGroup } from "@tanstack/react-table";
import React from "react";
import { ColVirtualizerContext } from "../contexts/col_virtualizer_context";
import { useTableProps } from "../hooks/use_table_props";
import {
  TriggerUpdateDep,
  useTriggerTablePropsUpdate,
} from "../hooks/use_trigger_table_props_update";
import { CombinedHeaderGroup, VirtualHeaderGroup } from "../types";
import { ColVirtualizerType } from "./col_virtualizer_type";
import {
  FilteredHeaderGroup,
  useHeaderGroupVirtualizers,
} from "./use_header_group_virtualizers";
import { HeaderIndex } from "./virtual_header/types";
import { shallowEqual } from "../../utils";

const combineHeaderGroups = (
  groups: HeaderGroup<any>[][],
  type: "header" | "footer",
): FilteredHeaderGroup => {
  const numGroups = Math.max(...groups.map((group) => group.length));
  const combinedGroups: CombinedHeaderGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    combinedGroups[i] = {
      id: groups.map((group) => group[i].id).join(""),
      _slow_headers: groups.flatMap((group) => {
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
    group._slow_headers.forEach((header, j) => {
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
        type,
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
    group._slow_headers.forEach((header, j) => {
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

const useHeaderGroups = (type: "header" | "footer", rerender: () => void) => {
  const { leftHeaderGroups, centerHeaderGroups, rightHeaderGroups } =
    useTableProps({
      selector: (table) => table.tanstackTable,
      callback: (tanstackTable) => {
        const [leftHeaderGroups, centerHeaderGroups, rightHeaderGroups] =
          type === "header"
            ? [
                tanstackTable.getLeftHeaderGroups(),
                tanstackTable.getCenterHeaderGroups(),
                tanstackTable.getRightHeaderGroups(),
              ]
            : [
                tanstackTable.getLeftFooterGroups(),
                tanstackTable.getCenterFooterGroups(),
                tanstackTable.getRightFooterGroups(),
              ];
        return {
          leftHeaderGroups,
          centerHeaderGroups,
          rightHeaderGroups,
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: shallowEqual,
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
        rerender,
      }),
      [type, rerender],
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
  useTableProps({
    callback: () => ({}),
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: () => false,
  });

  /**
   * To batch the updates from the horizontal virtualizers se use the renderCountRef
   * to trigger a re-render of the virtualizers
   */
  const [renderCount, setRenderCount] = React.useState(0);
  const renderCountRef = React.useRef(renderCount);
  renderCountRef.current = renderCount;
  const rerender = React.useCallback(() => {
    setRenderCount(renderCountRef.current + 1);
  }, []);

  const getHeaderGroups = useHeaderGroups("header", rerender);
  const getFooterGroups = useHeaderGroups("footer", rerender);

  const getMainHeaderGroup: () => VirtualHeaderGroup = () => {
    const headerGroups = getHeaderGroups();
    const mainHeaderGroup =
      headerGroups[headerGroups.length - 1] ?? getFooterGroups()[0];
    if (!mainHeaderGroup) {
      throw new Error("Implement me using the body virtualizer");
    }
    return mainHeaderGroup;
  };

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

  useTriggerTablePropsUpdate([
    ...[...getHeaderGroups(), ...getFooterGroups()].map(
      (group): TriggerUpdateDep => {
        const { offsetLeft, offsetRight } = group.getOffsets();
        return {
          dependency: {
            type: "col_offsets",
            groupType: group.type,
            // groupIndex: group.groupIndex,
          },
          cacheKey: `${offsetLeft},${offsetRight}`,
        };
      },
    ),
  ]);

  useTriggerTablePropsUpdate([
    {
      dependency: { type: "col_visible_range_main" },
      cacheKey: getMainHeaderGroup()
        .getHeaders()
        .map((vi) => vi.id)
        .join(","),
    },
  ]);

  const mainOffsets = getMainHeaderGroup().getOffsets();
  useTriggerTablePropsUpdate([
    {
      dependency: { type: "col_offsets_main" },
      cacheKey: `${mainOffsets.offsetLeft},${mainOffsets.offsetRight}`,
    },
  ]);

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
