import React from "react";
import { useTableProps } from "./hooks/use_table_props";
import { TableRow } from "./rows/table_row";
import { useTableContext } from "./table_context";
import { shallowEqual } from "../utils";

export const TableBody = React.memo(function TableBody() {
  const { skin } = useTableContext();

  const { offsetTop, offsetBottom, hasRows, pinRowsRelativeTo } = useTableProps(
    {
      callback: (props) => {
        const { offsetTop, offsetBottom, hasRows } = props.virtualData.body;
        return {
          offsetTop,
          offsetBottom,
          hasRows,
          pinRowsRelativeTo: props.uiProps.pinRowsRelativeTo,
        };
      },
      areCallbackOutputEqual: shallowEqual,
      dependencies: [
        { type: "ui_props" },
        { type: "tanstack_table" },
        { type: "row_offsets" },
      ],
    },
  );

  if (!hasRows) {
    return null;
  }

  return (
    <skin.TableBody>
      <RowsSlice position="top" />

      <div
        style={{ height: offsetTop, flexShrink: 0 }}
        className="offset-top"
      />

      <RowsSlice position="center" />

      <div
        style={
          pinRowsRelativeTo === "rows"
            ? { height: offsetBottom, flexShrink: 0 }
            : { minHeight: offsetBottom, flexShrink: 0, flexGrow: 1 }
        }
        className="offset-bottom"
      />

      <RowsSlice position="bottom" />
    </skin.TableBody>
  );
});

const RowsSlice = React.memo(function RowsSlice({
  position,
}: {
  position: "top" | "bottom" | "center";
}) {
  const { skin } = useTableContext();
  const rows = useTableProps({
    areCallbackOutputEqual: shallowEqual,
    callback: (props) => {
      return props.virtualData.body.rows[position].map((row) => row.rowIndex);
    },
    dependencies: [{ type: "row_visible_range" }, { type: "tanstack_table" }],
  });
  if (rows.length === 0) {
    return null;
  }
  const base = (
    <>
      {rows.map((rowIndex) => {
        return <TableRow key={rowIndex} rowIndex={rowIndex} />;
      })}
    </>
  );
  if (position === "top") {
    return <skin.PinnedRows position="top">{base}</skin.PinnedRows>;
  }
  if (position === "bottom") {
    return <skin.PinnedRows position="bottom">{base}</skin.PinnedRows>;
  }
  return base;
});
