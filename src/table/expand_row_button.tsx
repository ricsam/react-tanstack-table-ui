import { Row } from "@tanstack/react-table";
import React from "react";
import { DndRowContext } from "./dnd_provider";

export const ExpandRowButton = ({ row }: { row: Row<any> }) => {
  const ctx = React.useContext(DndRowContext);
  if (!ctx) {
    throw new Error("useAnoDrag must be used within AnoDndProvider");
  }

  // Since rows are flattened by default,
  // we can use the row.depth property
  // and paddingLeft to visually indicate the depth
  // of the row
  let depth = row.depth;

  if (ctx.moveResult) {
    const ancestors = ctx.moveResult.ancestors[row.id];
    depth = ancestors.length;
  }

  return (
    <div
      style={{
        paddingLeft: `${row.depth * 2}rem`,
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      {row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
          }}
        >
          {row.getIsExpanded() ? "👇" : "👉"}
        </button>
      ) : (
        "🔵"
      )}{" "}
    </div>
  );
};
