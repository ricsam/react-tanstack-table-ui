import React from "react";
import { shallowEqual } from "../../utils";
import { useTableProps } from "../hooks/use_table_props";
import { useTableContext } from "../table_context";
import { HeaderColsSlice } from "./header_cols_slice";

export const HeaderGroup = React.memo(function HeaderGroup({
  groupIndex,
  type,
}: {
  groupIndex: number;
  type: "header" | "footer";
}) {
  const { skin } = useTableContext();

  const { offsetLeft, offsetRight, pinColsRelativeTo } = useTableProps({
    selector(props) {
      const headerGroup =
        type === "header"
          ? props.virtualData.header.groupLookup[groupIndex]
          : props.virtualData.footer.groupLookup[groupIndex];
      return { headerGroup, uiProps: props.uiProps };
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
  });

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
