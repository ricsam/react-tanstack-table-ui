import { shallowEqual, useColProps, useColRef } from "@rttui/core";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";

export const HeaderPinButtons = () => {
  const { isPinned, canPin } = useColProps({
    callback: ({ vheader }) => ({
      isPinned: vheader.state.isPinned,
      canPin: vheader.header.column.getCanPin(),
    }),
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
  });

  const headerRef = useColRef();
  if (!canPin) {
    return null;
  }
  return (
    <div style={{ display: "flex", gap: "-4px", justifyContent: "flex-start" }}>
      {isPinned !== "start" ? (
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "2px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            opacity: 0.5,
          }}
          onClick={() => {
            headerRef().column.pin("left");
          }}
        >
          <ChevronLeft />
        </button>
      ) : null}
      {isPinned ? (
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "2px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            opacity: 0.7,
          }}
          onClick={() => {
            headerRef().column.pin(false);
          }}
        >
          <Close />
        </button>
      ) : null}
      {isPinned !== "end" ? (
        <button
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "2px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            opacity: 0.5,
          }}
          onClick={() => {
            headerRef().column.pin("right");
          }}
        >
          <ChevronRight />
        </button>
      ) : null}
    </div>
  );
};
