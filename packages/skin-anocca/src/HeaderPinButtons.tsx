import { useVirtualHeader } from "@rttui/core";
import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";

export const HeaderPinButtons = () => {
  const vHeader = useVirtualHeader();
  const header = vHeader?.header;
  if (!header) {
    return null;
  }
  const isPinned = vHeader.isPinned;
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
            if (!header) {
              return;
            }
            header.column.pin("left");
          }}
        >
          <MdChevronLeft />
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
            if (!header) {
              return;
            }
            header.column.pin(false);
          }}
        >
          <MdClose />
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
            if (!header) {
              return;
            }
            header.column.pin("right");
          }}
        >
          <MdChevronRight />
        </button>
      ) : null}
    </div>
  );
};
