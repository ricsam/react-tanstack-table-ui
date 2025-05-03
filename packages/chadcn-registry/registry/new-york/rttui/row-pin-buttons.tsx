import { useRowProps, useRowRef, shallowEqual } from "@rttui/core";

export function RowPinButtons() {
  const { canPin, isPinned } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canPin: row.getCanPin(),
        isPinned: row.getIsPinned(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [
      { type: "tanstack_table" },
    ],
  });
  const rowRef = useRowRef();
  if (!canPin) {
    return null;
  }

  if (isPinned) {
    return (
      <button
        onClick={() => rowRef()?.row.pin(false, true, true)}
        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent text-muted-foreground cursor-pointer"
      >
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex text-muted-foreground">
      <button
        onClick={() => rowRef()?.row.pin("top", true, true)}
        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent"
      >
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
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>
      <button
        onClick={() => rowRef()?.row.pin("bottom", true, true)}
        className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-accent"
      >
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
      </button>
    </div>
  );
}
