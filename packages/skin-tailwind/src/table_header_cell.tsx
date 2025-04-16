import { useColProps } from "@rttui/core";
import React from "react";

export const TableHeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasuring: boolean;
      children: React.ReactNode;
    }
  >(({ isMeasuring, children }, ref) => {
    const {
      isSomeColumnsPinnedRight,
      headerId,
      isPinned,
      width,
      isLast,
      isLastPinned,
      isLastCenter,
      columnId,
    } = useColProps(({ vheader, table }) => {
      const state = vheader.getState();
      return {
        isSomeColumnsPinnedRight: table.getIsSomeColumnsPinned("right"),
        headerId: vheader.id,
        isPinned: state.isPinned,
        width: state.width,
        isLast: state.isLast,
        isLastPinned: state.isLastPinned,
        isLastCenter: state.isLastCenter,
        columnId: vheader.columnId,
      };
    });
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
          borderRight:
            ((isPinned === "start" && !isLastPinned) || !isPinned) &&
            !isLast &&
            !(isLastCenter && isSomeColumnsPinnedRight)
              ? `1px solid var(--table-border-color)`
              : undefined,
          borderLeft:
            isPinned === "end" && !isLastPinned
              ? `1px solid var(--table-border-color)`
              : undefined,
        }}
      >
        <div className="flex-1 flex justify-start">{children}</div>
      </div>
    );
  }),
);
