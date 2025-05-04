"use client";
import { useEffect, useState } from "react";
import {
  AutoSizerContext,
  AutoSizerContextType,
  NotifyPayload,
} from "./table/contexts/auto_sizer_context";
import React from "react";
import { shallowEqual } from "./utils";

type AutoSizerProps = {
  adaptContainerToTable?: {
    /**
     * @default false
     */
    width?: boolean;
    /**
     * @default true
     */
    height?: boolean;
  };
  adaptTableToContainer?: {
    /**
     * @default true
     */
    width?: boolean;
    /**
     * @default false
     */
    height?: boolean;
  };
} & React.HTMLAttributes<HTMLDivElement>;

export const AutoSizer = ({
  children,
  adaptTableToContainer: {
    width: adaptTableToContainerWidth = true,
    height: adaptTableToContainerHeight = false,
  } = {},
  adaptContainerToTable: {
    width: adaptContainerToTableWidth = false,
    height: adaptContainerToTableHeight = true,
  } = {},
  ...divProps
}: AutoSizerProps) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [innerRef, setInnerRef] = useState<HTMLDivElement | null>(null);
  const [innerWidth, setInnerWidth] = useState<number | undefined>(undefined);
  const [innerHeight, setInnerHeight] = useState<number | undefined>(undefined);

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const tableFixedSizeRef = React.useRef<
    | undefined
    | {
        width?: number;
        height?: number;
      }
  >(undefined);

  type Size = {
    width?: number | string;
    height?: number | string;
  };

  type SizeCallback = (size: Size) => void;

  const getInnerSize = React.useCallback(
    (
      innerWidth: number | undefined,
      innerHeight: number | undefined,
    ): Size => ({
      height:
        adaptContainerToTableHeight && typeof innerHeight === "number"
          ? innerHeight
          : undefined,
      width:
        adaptContainerToTableWidth && typeof innerWidth === "number"
          ? innerWidth
          : "100%",
    }),
    [adaptContainerToTableHeight, adaptContainerToTableWidth],
  );

  const sizeRef = React.useRef<Size>(getInnerSize(innerWidth, innerHeight));

  const [callbacks] = React.useState<SizeCallback[]>(() => {
    return [];
  });

  const subscribe = (cb: SizeCallback) => {
    callbacks.push(cb);
  };

  const unsubscribe = (cb: SizeCallback) => {
    callbacks.splice(callbacks.indexOf(cb), 1);
  };

  const unsubscribeAll = () => {
    callbacks.length = 0;
  };

  const lastCallbackVal = React.useRef<Size>(sizeRef.current);

  const runCallback = React.useCallback((cb: SizeCallback) => {
    const sizeRefVal = {
      ...sizeRef.current,
    };
    if (!sizeRefVal.width) {
      delete sizeRefVal.width;
    }
    if (!sizeRefVal.height) {
      delete sizeRefVal.height;
    }
    const tableFixedSizeVal = {
      ...tableFixedSizeRef.current,
    };
    if (!tableFixedSizeVal.width) {
      delete tableFixedSizeVal.width;
    }
    if (!tableFixedSizeVal.height) {
      delete tableFixedSizeVal.height;
    }
    const callbackVal = {
      ...sizeRefVal,
      ...tableFixedSizeVal,
    }
    if (shallowEqual(lastCallbackVal.current, callbackVal)) {
      return;
    }
    lastCallbackVal.current = callbackVal;
    cb(callbackVal);
  }, []);

  const notify = React.useCallback(
    (payload: NotifyPayload) => {
      for (const cb of callbacks) {
        if (payload.type === "innerSize") {
          sizeRef.current = getInnerSize(
            payload.size.width,
            payload.size.height,
          );
        } else {
          const val = {
            ...payload.size,
          };
          if (!val.width) {
            delete val.width;
          }
          if (!val.height) {
            delete val.height;
          }
          tableFixedSizeRef.current = val;
        }
        runCallback(cb);
      }
    },
    [callbacks, getInnerSize, runCallback],
  );

  const ctx: AutoSizerContextType | undefined = React.useMemo(
    () =>
      typeof width === "number" && typeof height === "number"
        ? {
            width: adaptTableToContainerWidth ? width : undefined,
            height: adaptTableToContainerHeight ? height : undefined,
            wrapperRef,
            notify,
          }
        : undefined,
    [
      width,
      height,
      adaptTableToContainerWidth,
      adaptTableToContainerHeight,
      notify,
    ],
  );

  useEffect(() => {
    if (!ref) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setWidth(entry.contentRect.width);
      setHeight(entry.contentRect.height);
    });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!innerRef) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setInnerWidth(entry.contentRect.width);
      setInnerHeight(entry.contentRect.height);
      notify({
        type: "innerSize",
        size: {
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        },
      });
    });
    observer.observe(innerRef);
    return () => observer.disconnect();
  }, [innerRef, notify]);

  return (
    <div
      ref={(el) => {
        if (el) {
          const cb: SizeCallback = (size) => {
            if (size.width) {
              if (typeof size.width === "number") {
                el.style.width = `${size.width}px`;
              } else {
                el.style.width = size.width;
              }
            }
            if (size.height) {
              if (typeof size.height === "number") {
                el.style.height = `${size.height}px`;
              } else {
                el.style.height = size.height;
              }
            }
          };
          subscribe(cb);
          runCallback(cb);
          return () => {
            unsubscribe(cb);
          };
        } else {
          unsubscribeAll();
        }
      }}
      {...divProps}
      style={{
        position: "relative",
        ...divProps.style,
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
