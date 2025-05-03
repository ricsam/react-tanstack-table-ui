import { useRowProps, useRowRef, shallowEqual } from "@rttui/core";

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
      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent text-muted-foreground cursor-pointer"
    >
      {isExpanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
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
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
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
