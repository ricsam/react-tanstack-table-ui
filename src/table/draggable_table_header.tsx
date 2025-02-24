import { flexRender, Header, Table } from "@tanstack/react-table";
import { useColAttrs } from "./use_col_attrs";
import { CSSProperties } from "react";

export const DraggableTableHeader = <T,>({
  header,
  table,
  start,
  offsetLeft,
  defToRender,
}: {
  header: Header<T, unknown>;
  table: Table<T>;
  start: number;
  offsetLeft: number;
  defToRender: "header" | "footer";
}) => {
  const {
    isDragging,
    transform,
    transition,
    isPinned,
    dragStyle,
    attributes,
    listeners,
    setNodeRef,
  } = useColAttrs({
    cell: header,
    start,
    offsetLeft,
  });

  // const {
  //   transform: _transform,
  //   isDragging,
  //   transition,
  //   setNodeRef,
  //   listeners,
  //   attributes,
  //   pinned,
  // } = useAnoDrag(AnoDndColContext, header.column.id, header.column.getIndex());

  // const dragTransform = _transform ? ` + ${_transform.x}px` : "";

  // const isPinned = pinned ?? header.column.getIsPinned();

  // const transform = isPinned
  //   ? "none"
  //   : `translate3d(calc(0px${dragTransform}), 0, 0)`;
  // : `translate3d(calc(var(--virtual-padding-left, 0) * 1px${dragTransform}), 0, 0)`;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    // transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transform,
    transition,
    whiteSpace: "nowrap",
    zIndex: isDragging || isPinned ? 1 : 0,
    display: "flex",
    paddingRight: "8px",
    paddingLeft: "8px",
    overflow: "hidden",
    height: "32px",
    // ...getCommonPinningStyles(header.column),
    // width: `calc(var(--header-${header?.id}-size) * 1px)`,
    width: header.getSize(),
    // left: isPinned ? header.getStart("left") : start,
    // position: isPinned ? "sticky" : "absolute",
    backgroundColor: isPinned ? "black" : "transparent",
    ...dragStyle,
  };

  return (
    <div key={header.id} ref={setNodeRef} className="th" style={style}>
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {header.isPlaceholder
          ? null
          : flexRender(
              header.column.columnDef[defToRender],
              header.getContext(),
            )}
        <div style={{ width: "4px" }}></div>
      </div>
      {/* {header.subHeaders.length === 0 && ( */}
      <button {...attributes} {...listeners}>
        🟰
      </button>
      {/* )} */}
      {header.column.getCanPin() && (
        <div className="flex gap-1 justify-center">
          {header.column.getIsPinned() !== "left" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin("left");
                // table.resetColumnSizing(true);
              }}
            >
              {"<="}
            </button>
          ) : null}
          {header.column.getIsPinned() ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin(false);
                // table.resetColumnSizing(true);
              }}
            >
              X
            </button>
          ) : null}
          {header.column.getIsPinned() !== "right" ? (
            <button
              className="border rounded px-2"
              onClick={() => {
                header.column.pin("right");
                // table.resetColumnSizing(true);
              }}
            >
              {"=>"}
            </button>
          ) : null}
        </div>
      )}
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
};
