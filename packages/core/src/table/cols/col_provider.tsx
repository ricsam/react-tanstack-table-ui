import { HeaderGroup } from "@tanstack/react-table";
import React from "react";
import { useTableContext } from "../table_context";
import { CombinedHeaderGroup } from "../types";
import { ColContext } from "./col_context";
import { VirtualHeaderGroup } from "./header_group";
import { useHeaderGroupVirtualizers } from "./use_header_group_virtualizers";

const combinedHeaderGroups = (
  ...groups: HeaderGroup<any>[][]
): CombinedHeaderGroup[] => {
  const numGroups = Math.max(...groups.map((group) => group.length));
  const combinedGroups: CombinedHeaderGroup[] = [];
  for (let i = 0; i < numGroups; i++) {
    combinedGroups[i] = {
      id: "",
      headers: [],
      headerGroups: [],
    };
    groups.forEach((group) => {
      combinedGroups[i].id += group[i].id;
      combinedGroups[i].headers.push(...group[i].headers);
      combinedGroups[i].headerGroups.push(group[i]);
    });
  }
  return combinedGroups;
};
export const ColProvider = ({ children }: { children: React.ReactNode }) => {
  const { table } = useTableContext();
  const state = table.getState();

  const dependencies: any[] = [table, state];

  const headerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: React.useMemo(() => {
      return combinedHeaderGroups(
        table.getLeftHeaderGroups(),
        table.getCenterHeaderGroups(),
        table.getRightHeaderGroups(),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies),
    type: "header",
  });
  const footerGroups: VirtualHeaderGroup[] = useHeaderGroupVirtualizers({
    headerGroups: React.useMemo(
      () => {
        return combinedHeaderGroups(
          table.getLeftFooterGroups(),
          table.getCenterFooterGroups(),
          table.getRightFooterGroups(),
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      dependencies,
    ),
    type: "footer",
  });

  const mainHeaderGroup: VirtualHeaderGroup | undefined =
    headerGroups[headerGroups.length - 1] ?? footerGroups[0];

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

  if (!mainHeaderGroup) {
    throw new Error("Implement me using the body virtualizer");
  }
  // console.log("headerGroups", headerGroups, mainHeaderGroup);
  return (
    <ColContext.Provider
      value={React.useMemo(() => {
        return {
          onDragStart: () => {},
          setIsDragging: () => {},
          headerGroups,
          footerGroups,
          mainHeaderGroup,
        };
      }, [headerGroups, footerGroups, mainHeaderGroup])}
    >
      {children}
    </ColContext.Provider>
  );
};
