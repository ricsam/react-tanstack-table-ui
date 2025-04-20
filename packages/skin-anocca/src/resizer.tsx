import { Box } from "@mui/material";
import { useColRef, useCrushHeader } from "@rttui/core";
import { useColProps } from "@rttui/core";
import React from "react";
import { shallowEqual } from "@rttui/core";
export function Resizer() {
  const crushHeader = useCrushHeader();

  const { canResize, isResizing } = useColProps({
    callback: ({ column }) => {
      return {
        canResize: column.getCanResize(),
        isResizing: column.getIsResizing(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
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
    <>
      {canResize && (
        <Box
          {...{
            onDoubleClick: () => {
              crushHeader(colRef().header);
            },
            onMouseDown: (ev: any) => colRef().header.getResizeHandler()(ev),
            onTouchStart: (ev: any) => colRef().header.getResizeHandler()(ev),
            className: `resizer ${isResizing ? "isResizing" : ""}`,
            sx: {
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "3px",
              cursor: "col-resize",
              userSelect: "none",
              touchAction: "none",
              opacity: 0,
              backgroundColor: (theme) => theme.palette.text.secondary,
              transition: "opacity 0.2s",
              "&.isResizing": {
                backgroundColor: (theme) => theme.palette.primary.main,
                opacity: 1,
                width: "1px",
              },
            },
          }}
        />
      )}
    </>
  );
}
