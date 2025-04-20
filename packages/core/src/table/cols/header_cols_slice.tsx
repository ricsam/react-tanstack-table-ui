import React from "react";
import { createTablePropsSelector, shallowEqual } from "../../utils";
import { useTableContext } from "../table_context";
import { PinPos } from "../types";
import { TableHeaderCell } from "./table_header_cell";

const colsSelector = createTablePropsSelector(
  (
    type: "header" | "footer",
    position: "left" | "right" | "center",
    groupIndex: number,
  ) => ({
    selector(props) {
      const headerGroups =
        type === "header" ? props.virtualData.header : props.virtualData.footer;
      const headerGroup = headerGroups.groupLookup[groupIndex];
      const headers = headerGroup[position];
      return headers;
    },
    shouldUnmount: (table) => {
      if (
        table.virtualData[type]?.groupLookup[groupIndex]?.[position] ===
        undefined
      ) {
        return true;
      }
      return false;
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
  }),
);

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
  const cols = colsSelector.useTableProps(
    type,
    pinPos === "start" ? "left" : pinPos === "end" ? "right" : "center",
    groupIndex,
  );

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
