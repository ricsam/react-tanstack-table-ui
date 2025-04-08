import { useCrushHeader } from "@rttui/core";
import { Header } from "@tanstack/react-table";
import React from "react";

export function Resizer({ header }: { header: Header<any, unknown> }) {
  const canResize = header?.column.getCanResize();
  const crushHeader = useCrushHeader();
  const isResizing = header.column.getIsResizing();

  React.useEffect(() => {
    if (!isResizing) {
      return;
    }
    const preventDefault = (e: Event) => {
      e.preventDefault();
    };
    document.body.addEventListener("select", preventDefault);
    document.body.addEventListener("selectstart", preventDefault);
    document.body.style.userSelect = "none";
    return () => {
      document.body.removeEventListener("select", preventDefault);
      document.body.removeEventListener("selectstart", preventDefault);
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  if (!canResize || !header) {
    return null;
  }
  return (
    <div
      {...{
        // onDoubleClick: () => header.column.resetSize(),
        onDoubleClick: () => {
          crushHeader(header);
        },

        onMouseDown: header.getResizeHandler(),
        onTouchStart: header.getResizeHandler(),
        className: `absolute top-0 right-0 h-full w-1 cursor-col-resize transition-opacity opacity-0 hover:opacity-50 hover:w-1 bg-indigo-500 dark:bg-indigo-400 ${header.column.getIsResizing() ? "opacity-50 w-1" : ""}`,
      }}
    />
  );
}
