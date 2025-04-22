import {
  shallowEqual,
  useColProps,
  useCrushHeader,
  useColRef,
} from "@rttui/core";
import React from "react";
import Box from "@mui/material/Box";

// TODO: Implement MUI skin component
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

  // This effect prevents text selection during resize, same as Tailwind
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
    <Box
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
      onMouseDown={(ev: any) => colRef().header.getResizeHandler()(ev)}
      onTouchStart={(ev: any) => colRef().header.getResizeHandler()(ev)}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: isResizing ? "3px" : "3px", // Keep width consistent, use opacity/color
        cursor: "col-resize",
        backgroundColor: isResizing ? "primary.main" : "transparent", // Show color only when resizing or hovering
        opacity: isResizing ? 0.7 : 0,
        transition: (theme) => theme.transitions.create(["opacity", "background-color"], {
          duration: theme.transitions.duration.shortest,
        }),
        "&:hover": {
          opacity: 0.7,
          backgroundColor: "primary.light",
        },
      }}
    />
  );
} 