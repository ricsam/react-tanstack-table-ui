import React from "react";
import { useColProps } from "../table/hooks/use_col_props";
import { shallowEqual } from "../utils";

export const HeaderCell = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      isMeasureInstance?: boolean;
      children: React.ReactNode;
    }
  >(({ isMeasureInstance, children }, ref) => {
    const { isPinned, width, headerId } = useColProps({
      callback: ({ header, vheader }) => {
        const state = vheader.state;

        return {
          isPinned: state.isPinned,
          width: state.width,
          headerId: header.id,
          isPlaceholder: header.isPlaceholder,
        };
      },
      dependencies: [{ type: "tanstack_table" }],
      areCallbackOutputEqual: shallowEqual,
    });
    return (
      <div
        className="th"
        ref={ref}
        data-header-id={headerId}
        style={{
          opacity: 1,
          transition: "none",
          whiteSpace: "nowrap",
          zIndex: isPinned ? 1 : 0,
          display: "flex",
          overflow: "hidden",
          width: isMeasureInstance ? "auto" : width,
          backgroundColor: "var(--table-header-bg)",
          position: "relative",
          flexShrink: 0,
          paddingLeft: "8px",
          paddingRight: "8px",
          margin: 0,
          boxSizing: "border-box",
          borderRight: "1px solid var(--table-border-color)",
          fontWeight: "600",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          {children}
        </div>
      </div>
    );
  }),
);
