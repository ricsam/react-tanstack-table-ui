import { shallowEqual, useColProps, useColRef } from "@rttui/core";

export function HeaderPinButtons() {
  const { isPinned } = useColProps({
    callback: ({ vheader, column }) => {
      return {
        isPinned: vheader.state.isPinned,
        canPin: column.getCanPin(),
      };
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
  });

  const colRef = useColRef();

  return (
    <div className="flex gap-1">
      {isPinned !== "start" ? (
        <button
          className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => {
            colRef.current.column.pin("left");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      ) : null}
      {isPinned ? (
        <button
          className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => {
            colRef.current.column.pin(false);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ) : null}
      {isPinned !== "end" ? (
        <button
          className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => {
            colRef.current.column.pin("right");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      ) : null}
    </div>
  );
}
