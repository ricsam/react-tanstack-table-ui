import { useColProps, useColRef } from "@rttui/core";
import { MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";

export const HeaderPinButtons = () => {
  const isPinned = useColProps(({ vheader }) => vheader.isPinned);
  const headerRef = useColRef();
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
            headerRef.current.column.pin("left");
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
            headerRef.current.column.pin(false);
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
            headerRef.current.column.pin("right");
          }}
        >
          <MdChevronRight />
        </button>
      ) : null}
    </div>
  );
};
