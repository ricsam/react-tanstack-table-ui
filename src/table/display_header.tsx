import { flexRender, Header } from "@tanstack/react-table";

export function DisplayHeader<T>({
  header,
  defToRender,
}: {
  header: Header<T, unknown>;
  defToRender: "footer" | "header";
}) {
  const isPinned = header.column.getIsPinned();
  return (
    <div
      key={header.id}
      {...{
        className: "th",
        style: {
          // ...getCommonPinningStyles(header.column),
          // transform: isPinned ? "none" : `translate3d(${offsetLeft}px, 0, 0)`,
          transition: "width transform 0.2s ease-in-out",
          whiteSpace: "nowrap",
          display: "flex",
          paddingRight: "8px",
          paddingLeft: "8px",
          overflow: "hidden",
          height: "32px",
          // width: `calc(var(--header-${header?.id}-size) * 1px)`,
          width: header.getSize(),
          left:
            isPinned === "left" ? header.column.getStart("left") : undefined,
          right:
            isPinned === "right" ? header.column.getAfter("right") : undefined,
          position: isPinned ? "sticky" : "relative",
          backgroundColor: isPinned ? "black" : "transparent",
          zIndex: isPinned ? 2 : 1,
        },
      }}
    >
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {header.isPlaceholder
          ? null
          : flexRender(
              header.column.columnDef[defToRender],
              header.getContext(),
            )}
        <div style={{ width: "4px" }}></div>
      </div>
      <div
        {...{
          onDoubleClick: () => header.column.resetSize(),
          onMouseDown: header.getResizeHandler(),
          onTouchStart: header.getResizeHandler(),
          className: `resizer ${
            header.column.getIsResizing() ? "isResizing" : ""
          }`,
        }}
      />
    </div>
  );
}
