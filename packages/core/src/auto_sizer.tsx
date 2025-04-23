import { useEffect, useState } from "react";
import {
  AutoSizerContext,
  AutoSizerContextType,
} from "./table/contexts/auto_sizer_context";
import React from "react";

type AutoSizerProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  adaptContainerToTable?: {
    width?: boolean;
    height?: boolean;
  };
  adaptTableToContainer?: {
    width?: boolean;
    height?: boolean;
  };
};

export const AutoSizer = ({
  children,
  style,
  adaptTableToContainer: {
    width: measureWidth = true,
    height: measureHeight = true,
  } = {},
  adaptContainerToTable: {
    width: autoWidth = false,
    height: autoHeight = false,
  } = {},
}: AutoSizerProps) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [innerRef, setInnerRef] = useState<HTMLDivElement | null>(null);
  const [innerWidth, setInnerWidth] = useState<number | undefined>(undefined);
  const [innerHeight, setInnerHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!ref) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
        setHeight(entry.contentRect.height);
      }
    });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!innerRef) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setInnerWidth(entry.contentRect.width);
        setInnerHeight(entry.contentRect.height);
      }
    });
    observer.observe(innerRef);
    return () => observer.disconnect();
  }, [innerRef]);

  const ctx: AutoSizerContextType | undefined = React.useMemo(
    () =>
      typeof width === "number" && typeof height === "number"
        ? {
            width: measureWidth ? width : undefined,
            height: measureHeight ? height : undefined,
          }
        : undefined,
    [width, height, measureWidth, measureHeight],
  );

  return (
    <div
      style={{
        position: "relative",
        height:
          !measureHeight && autoHeight && typeof innerHeight === "number"
            ? innerHeight
            : undefined,
        width:
          !measureWidth && autoWidth && typeof innerWidth === "number"
            ? innerWidth
            : undefined,
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0 }} ref={setRef}>
        {ctx && (
          <div ref={setInnerRef}>
            <AutoSizerContext.Provider value={ctx}>
              {children}
            </AutoSizerContext.Provider>
          </div>
        )}
      </div>
    </div>
  );
};
