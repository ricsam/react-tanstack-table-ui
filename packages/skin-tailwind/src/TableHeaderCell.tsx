import { type VirtualHeader } from "@rttui/core";
import { flexRender } from "@tanstack/react-table";
import React from "react";

export const TableHeaderCell = React.forwardRef<
  HTMLDivElement,
  VirtualHeader & {
    type: "header" | "footer";
    isMeasuring: boolean;
  }
>(({ headerId, isPinned, width, header, type, columnId, isMeasuring }, ref) => {
  return (
    <div
      className="th relative flex items-center px-2 py-3.5 text-sm font-semibold text-gray-900 dark:text-white overflow-hidden whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800"
      data-header-id={headerId}
      data-is-pinned={isPinned}
      data-column-id={columnId}
      ref={ref}
      style={{
        height: "var(--header-row-height)",
        width: isMeasuring ? "auto" : width,
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
    </div>
  );
});
