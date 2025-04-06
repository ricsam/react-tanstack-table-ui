import { useMeasureHeader } from "@rttui/core";
import { Header } from "@tanstack/react-table";

export function Resizer({ header }: { header: Header<any, unknown> }) {
  const canResize = header?.column.getCanResize();
  const measureHeader = useMeasureHeader();
  if (!canResize || !header) {
    return null;
  }
  return (
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
  );
}
