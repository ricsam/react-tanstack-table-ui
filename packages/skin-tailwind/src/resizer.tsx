import {
  shallowEqual,
  useColProps,
  useCrushHeader,
  useColRef,
} from "@rttui/core";
import React from "react";

export function Resizer() {
  const crushHeader = useCrushHeader();

  const { canResize, isResizing } = useColProps({
    callback: ({ column }) => {
      return {
        canResize: column.getCanResize(),
        isResizing: column.getIsResizing(),
      };
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
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
      onDoubleClick={(ev) => {
        crushHeader(colRef().header);
        ev.stopPropagation();
        ev.preventDefault();
      }}
      onMouseDown={(ev: any) => colRef().header.getResizeHandler()(ev)}
      onTouchStart={(ev: any) => colRef().header.getResizeHandler()(ev)}
      className={`absolute top-0 right-0 h-full w-1 cursor-col-resize transition-opacity opacity-0 hover:opacity-50 hover:w-1 bg-indigo-500 dark:bg-indigo-400 ${isResizing ? "opacity-50 w-1" : ""}`}
    />
  );
}
