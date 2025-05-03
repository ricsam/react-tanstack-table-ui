import React from "react";
import { useColProps } from "../table/hooks/use_col_props";
import { useColRef } from "../table/hooks/use_col_ref";
import { useCrushHeader } from "../table/hooks/use_crush_header";
import { shallowEqual } from "../utils";

// TODO: Implement default skin component
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
      onClick={(ev) => {
        if (ev.metaKey) {
          ev.stopPropagation();
          ev.preventDefault();
          crushHeader(colRef().header);
        }
      }}
      onMouseDown={colRef().header.getResizeHandler()}
      onTouchStart={colRef().header.getResizeHandler()}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: isResizing ? "4px" : "1px",
        cursor: "col-resize",
        transition: "opacity 0.2s",
        opacity: isResizing ? 0.5 : 0,
        backgroundColor: "var(--table-resizer-color, #6b7280)",
      }}
    />
  );
}
