import React from "react";
import { createTablePropsSelector, shallowEqual } from "../../utils";
import { useTableContext } from "../table_context";
import { HeaderColsSlice } from "./header_cols_slice";

const headerGroupSelector = createTablePropsSelector(
  (groupIndex: number, type: "header" | "footer") => ({
    selector(props) {
      const headerGroup =
        type === "header"
          ? props.virtualData.header.groupLookup[groupIndex]
          : props.virtualData.footer.groupLookup[groupIndex];
      return { headerGroup, uiProps: props.uiProps };
    },
    shouldUnmount: (table) => {
      return table.virtualData[type]?.groupLookup[groupIndex] === undefined;
    },
    callback: ({ headerGroup, uiProps }) => {
      const { offsetLeft, offsetRight } = headerGroup;
      return {
        offsetLeft,
        offsetRight,
        pinColsRelativeTo: uiProps.pinColsRelativeTo,
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [
      { type: "ui_props" },
      { type: "tanstack_table" },
      {
        type: "col_offsets",
        groupType: type,
        groupIndex,
      },
    ],
  }),
);

export const HeaderGroup = React.memo(function HeaderGroup({
  groupIndex,
  type,
}: {
  groupIndex: number;
  type: "header" | "footer";
}) {
  const { skin } = useTableContext();

  const { offsetLeft, offsetRight, pinColsRelativeTo } =
    headerGroupSelector.useTableProps(groupIndex, type);

  return (
    <skin.HeaderRow type={type}>
      <HeaderColsSlice type={type} pinPos="start" groupIndex={groupIndex} />
      <div style={{ width: offsetLeft, flexShrink: 0 }}></div>
      <HeaderColsSlice type={type} pinPos={false} groupIndex={groupIndex} />
      <div
        style={
          pinColsRelativeTo === "table"
            ? {
                minWidth: offsetRight,
                flexShrink: 0,
                flexGrow: 1,
              }
            : {
                width: offsetRight,
                flexShrink: 0,
              }
        }
      ></div>
      <HeaderColsSlice type={type} pinPos="end" groupIndex={groupIndex} />
    </skin.HeaderRow>
  );
});
