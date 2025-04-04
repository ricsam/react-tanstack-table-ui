import { useMeasureHeader, type VirtualHeader } from "@rttui/core";
import { flexRender } from "@tanstack/react-table";
import React from "react";

export function TableHeaderCell({
  headerId,
  isPinned,
  width,
  header,
  type,
}: VirtualHeader & {
  type: "header" | "footer";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const canPin = header?.column.getCanPin();
  const canResize = header?.column.getCanResize();
  const measureHeader = useMeasureHeader();

  return (
    <div
      className="th relative flex items-center px-2 py-3.5 text-sm font-semibold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800"
      data-header-id={headerId}
      data-is-pinned={isPinned}
      ref={ref}
      style={{
        height: "var(--header-row-height)",
        width,
        zIndex: isPinned ? 11 : 10,
        flexShrink: 0,
        boxSizing: "border-box",
        backgroundColor: "transparent",
        borderRight: "1px solid var(--table-border-color)",
      }}
    >
      <div className="flex-1 flex justify-start">
        {header && !header.isPlaceholder
          ? flexRender(header.column.columnDef[type], header.getContext())
          : null}
      </div>

      {canPin && header && (
        <div className="flex gap-1">
          {isPinned !== "start" ? (
            <button
              className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => {
                if (!header) {
                  return;
                }
                header.column.pin("left");
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
                if (!header) {
                  return;
                }
                header.column.pin(false);
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
                if (!header) {
                  return;
                }
                header.column.pin("right");
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
      )}

      {canResize && header && (
        <div
          {...{
            // onDoubleClick: () => header.column.resetSize(),
            onDoubleClick: () => {
              measureHeader(header);
            },

            onMouseDown: header.getResizeHandler(),
            onTouchStart: header.getResizeHandler(),
            className: `absolute top-0 right-0 h-full w-1 cursor-col-resize transition-opacity opacity-0 hover:opacity-50 hover:w-1 bg-indigo-500 dark:bg-indigo-400 ${header.column.getIsResizing() ? "opacity-50 w-1" : ""}`,
          }}
        />
      )}
    </div>
  );
}
