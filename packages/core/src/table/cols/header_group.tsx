import React from "react";
import { useTableContext } from "../table_context";
import { VirtualHeaderGroup } from "../types";
import { HeaderColsSlice } from "./header_cols_slice";
import { useTableProps } from "../hooks/use_table_props";

export const HeaderGroup = React.memo(function HeaderGroup({
  headerGroup,
}: {
  headerGroup: VirtualHeaderGroup;
}) {
  const { skin, pinColsRelativeTo } = useTableContext();
  const { offsetLeft, offsetRight } = useTableProps(
    () => {
      const { offsetLeft, offsetRight } = headerGroup.getOffsets();
      return {
        offsetLeft,
        offsetRight,
      };
    },
    {
      dependencies: [
        { type: "table" },
        {
          type: "col_offsets",
          groupType: headerGroup.type,
          groupId: headerGroup.id,
        },
      ],
    },
  );
  const { type } = headerGroup;
  const headerGroupRef = React.useRef(headerGroup);

  const getHeaders = React.useCallback(() => {
    return headerGroupRef.current.getHeaders();
  }, []);

  const groupId = headerGroup.id;

  return (
    <skin.HeaderRow type={type}>
      <HeaderColsSlice
        type={type}
        pinPos="start"
        getHeaders={getHeaders}
        groupId={groupId}
      />
      <div style={{ width: offsetLeft, flexShrink: 0 }}></div>
      <HeaderColsSlice
        type={type}
        pinPos={false}
        getHeaders={getHeaders}
        groupId={groupId}
      />
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
      <HeaderColsSlice
        type={type}
        pinPos="end"
        getHeaders={getHeaders}
        groupId={groupId}
      />
    </skin.HeaderRow>
  );
});
