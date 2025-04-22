import { useRowProps } from "../table/hooks/use_row_props";
import { useRowRef } from "../table/hooks/use_row_ref";
import { shallowEqual } from "../utils";

export function ExpandButton() {
  const { canExpand, isExpanded } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canExpand: row.getCanExpand(),
        isExpanded: row.getIsExpanded(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });

  const rowRef = useRowRef();

  if (!canExpand) {
    return null;
  }

  return (
    <button
      onClick={() => rowRef()?.row.toggleExpanded()}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "9999px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {isExpanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="var(--table-text-color, currentColor)"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          stroke="var(--table-text-color, currentColor)"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      )}
    </button>
  );
}
