import React from "react";
import { useTableProps } from "../hooks/use_table_props";
import { useTableContext } from "../table_context";
import { PinPos, VirtualHeaderCell, VirtualHeaderCellState } from "../types";
import { TableHeaderCell } from "./table_header_cell";

export const HeaderColsSlice = React.memo(function HeaderColsSlice({
  type,
  pinPos,
  getHeaders,
  groupId,
}: {
  type: "header" | "footer";
  pinPos: PinPos;
  getHeaders: () => VirtualHeaderCell[];
  groupId: string;
}) {
  const { skin } = useTableContext();
  const { cols } = useTableProps(
    () => {
      const headerStates: Record<string, VirtualHeaderCellState> = {};
      const headers = getHeaders();
      headers.forEach((header) => {
        headerStates[header.id] = header.getState();
      });
      let cacheKey = "";

      const cols = headers.filter((header) => {
        const pinned = headerStates[header.id].isPinned;
        const result = pinned === pinPos;
        if (result) {
          cacheKey += `${header.id},`;
        }
        return result;
      });

      return { cols, cacheKey };
    },
    {
      arePropsEqual: (prev, next) => {
        return prev.cacheKey === next.cacheKey;
      },
      dependencies: [
        { type: "table" },
        { type: "col_visible_range", groupType: type, groupId },
      ],
    },
  );

  if (cols.length === 0) {
    return null;
  }
  const base = (
    <>
      {cols.map((header) => {
        return <TableHeaderCell key={header.id} header={header} />;
      })}
    </>
  );
  if (pinPos === "start") {
    return (
      <skin.PinnedCols position="left" type={type}>
        {base}
      </skin.PinnedCols>
    );
  }
  if (pinPos === "end") {
    return (
      <skin.PinnedCols position="right" type={type}>
        {base}
      </skin.PinnedCols>
    );
  }
  return base;
});
