import { useRowProps } from "../table/hooks/use_row_props";
import { useRowRef } from "../table/hooks/use_row_ref";
import { shallowEqual } from "../utils";

export function RowPinButtons() {
  const { canPin, isPinned } = useRowProps({
    callback: (vrow) => {
      const row = vrow.row;
      return {
        canPin: row.getCanPin(),
        isPinned: row.getIsPinned(),
      };
    },
    areCallbackOutputEqual: shallowEqual,
    dependencies: [{ type: "tanstack_table" }],
  });

  const rowRef = useRowRef();

  if (!canPin) {
    return null;
  }

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    borderRadius: "9999px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  const svgStyle = {
    width: "16px",
    height: "16px",
    stroke: "var(--table-text-color, currentColor)",
    strokeWidth: 1.5,
    fill: "none",
  };

  if (isPinned) {
    return (
      <button
        onClick={() => rowRef()?.row.pin(false, true, true)}
        style={buttonStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={svgStyle}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  }

  return (
    <div style={{ display: "flex" }}>
      <button
        onClick={() => rowRef()?.row.pin("top", true, true)}
        style={buttonStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={svgStyle}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      </button>
      <button
        onClick={() => rowRef()?.row.pin("bottom", true, true)}
        style={buttonStyle}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={svgStyle}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
    </div>
  );
}
