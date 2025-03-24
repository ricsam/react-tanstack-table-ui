import { Row } from "@tanstack/react-table";
import { useRowContext } from "./row_context";

export const ExpandRowButton = ({ row }: { row: Row<any> }) => {
  const ctx = useRowContext();

  // Since rows are flattened by default,
  // we can use the row.depth property
  // and paddingLeft to visually indicate the depth
  // of the row
  let depth = row.depth;

  if (ctx.moveResult) {
    const ancestors = ctx.moveResult.ancestors[row.id];
    if (!ancestors) {
      depth = 0;
      console.log(ctx.moveResult.ancestors, row.id);
    } else {
      depth = ancestors.length;
    }
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
