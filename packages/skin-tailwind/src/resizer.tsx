import { useColProps, useCrushHeader, useColRef } from "@rttui/core";
import React from "react";

export function Resizer() {
  const crushHeader = useCrushHeader();

  const { canResize, isResizing } = useColProps(({ column }) => {
    return {
      canResize: column.getCanResize(),
      isResizing: column.getIsResizing(),
    };
  });

  const colRef = useColRef();

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

  if (!canResize) {
    return null;
  }
  return (
    <div
      {...{
        onDoubleClick: () => {
          crushHeader(colRef.current.header);
        },
        onMouseDown: (ev) => colRef.current.header.getResizeHandler()(ev),
        onTouchStart: (ev) => colRef.current.header.getResizeHandler()(ev),
        className: `absolute top-0 right-0 h-full w-1 cursor-col-resize transition-opacity opacity-0 hover:opacity-50 hover:w-1 bg-indigo-500 dark:bg-indigo-400 ${colRef.current.header.column.getIsResizing() ? "opacity-50 w-1" : ""}`,
      }}
    />
  );
}
