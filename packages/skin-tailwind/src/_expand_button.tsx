import { useRowProps, useRowRef } from "@rttui/core";

export function ExpandButton() {
  const { canExpand, isExpanded } = useRowProps((row) => {
    return {
      canExpand: row.getCanExpand(),
      isExpanded: row.getIsExpanded(),
    };
  });
  const rowRef = useRowRef();
  if (!canExpand) {
    return null;
  }
  return (
    <button
      onClick={() => rowRef.current.toggleExpanded()}
      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {isExpanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
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
          className="w-4 h-4 text-gray-600 dark:text-gray-400"
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
