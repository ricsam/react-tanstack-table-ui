import React from "react";
import { useTableProps } from "../hooks/use_table_props";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";
import { TableHeaderCell } from "./table_header_cell";
import { shallowEqual } from "../../utils";

export const HeaderColsSlice = React.memo(function HeaderColsSlice({
  type,
  pinPos,
  groupIndex,
}: {
  type: "header" | "footer";
  pinPos: PinPos;
  groupIndex: number;
}) {
  const { skin } = useTableContext();
  const cols = useTableProps({
    selector(props) {
      const headerGroups =
        type === "header" ? props.virtualData.header : props.virtualData.footer;
      const headerGroup = headerGroups.groupLookup[groupIndex];
      const position: "left" | "right" | "center" =
        pinPos === "start" ? "left" : pinPos === "end" ? "right" : "center";
      const headers = headerGroup[position];
      return headers;
    },
    callback: (headers) => {
      return headers.map((header) => header.headerIndex);
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [
      { type: "tanstack_table" },
      { type: "ui_props" },
      { type: "col_visible_range", groupType: type, groupIndex },
    ],
  });

  if (cols.length === 0) {
    return null;
  }

  const base = (
    <>
      {cols.map((headerIndex) => {
        return (
          <TableHeaderCell
            key={headerIndex}
            type={type}
            groupIndex={groupIndex}
            headerIndex={headerIndex}
          />
        );
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
