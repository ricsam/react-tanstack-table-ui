import React from "react";
import { createTablePropsSelector, shallowEqual } from "../../utils";
import { useTableContext } from "../table_context";
import { HeaderColsSlice } from "./header_cols_slice";

const headerGroupSelector = createTablePropsSelector(() => ({
  selector(props) {
    return props.uiProps;
  },
  callback: (uiProps) => {
    return {
      pinColsRelativeTo: uiProps.pinColsRelativeTo,
    };
  },
  areCallbackOutputEqual: shallowEqual,
  dependencies: [{ type: "ui_props" }, { type: "tanstack_table" }],
}));

export const HeaderGroup = React.memo(function HeaderGroup({
  groupIndex,
  type,
}: {
  groupIndex: number;
  type: "header" | "footer";
}) {
  const { skin } = useTableContext();

  const { pinColsRelativeTo } = headerGroupSelector.useTableProps();

  const offsetLeftVar = `var(--${type}-${groupIndex}-offset-left)`;
  const offsetRightVar = `var(--${type}-${groupIndex}-offset-right)`;

  return (
    <skin.HeaderRow type={type}>
      <HeaderColsSlice type={type} pinPos="start" groupIndex={groupIndex} />
      <div style={{ width: offsetLeftVar, flexShrink: 0 }}></div>
      <HeaderColsSlice type={type} pinPos={false} groupIndex={groupIndex} />
      <div
        style={
          pinColsRelativeTo === "table"
            ? {
                minWidth: offsetRightVar,
                flexShrink: 0,
                flexGrow: 1,
              }
            : {
                width: offsetRightVar,
                flexShrink: 0,
              }
        }
      ></div>
      <HeaderColsSlice type={type} pinPos="end" groupIndex={groupIndex} />
    </skin.HeaderRow>
  );
});
