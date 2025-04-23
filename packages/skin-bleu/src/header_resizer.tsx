import { IconButton, Tooltip } from "@mui/material";
import {
  shallowEqual,
  useColProps,
  useColRef,
  useCrushHeader,
} from "@rttui/core";
import React from "react";
import { BiMoveHorizontal } from "react-icons/bi";

export function HeaderResizer() {
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

  const [open, setOpen] = React.useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const onMouseDown = (
    ev:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>,
  ) => {
    if (ev.metaKey) {
      return;
    }
    colRef().header.getResizeHandler()(ev);
  };

  const button = (
    <IconButton
      sx={{
        width: "var(--row-height)",
        height: "var(--row-height)",
      }}
      size="small"
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
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    >
      <BiMoveHorizontal />
    </IconButton>
  );

  if (!canResize) {
    return null;
  }

  return (
    <>
      {canResize && (
        <>
          <Tooltip
            title="Drag to resize column. Double or cmd click to reset width"
            placement="top"
            disableFocusListener
            disableTouchListener
            disableInteractive
            sx={{ pointerEvents: "none" }}
            open={open && !isResizing}
            onClose={handleClose}
            onOpen={handleOpen}
          >
            {button}
          </Tooltip>
        </>
      )}
    </>
  );
}
