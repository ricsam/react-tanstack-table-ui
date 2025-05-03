import { CheckboxProps, shallowEqual, useTableProps } from "@rttui/core";
import { useLayoutEffect, useRef } from "react";

export const Checkbox = ({ getProps, onChange }: CheckboxProps) => {
  const resolvedRef = useRef<HTMLInputElement>(null);
  const { checked, indeterminate, disabled, value } = useTableProps({
    callback: () => {
      return getProps();
    },
    dependencies: [{ type: "tanstack_table" }],
    areCallbackOutputEqual: shallowEqual,
    shouldUnmount: () => {
      try {
        getProps();
        return false;
      } catch (e) {
        return true;
      }
    },
  });

  useLayoutEffect(() => {
    if (resolvedRef.current) {
      resolvedRef.current.indeterminate = !!indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <div className="group grid size-4 grid-cols-1">
      <input
        type="checkbox"
        className={`col-start-1 row-start-1 appearance-none rounded border border bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:border disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto`}
        ref={resolvedRef}
        name={"checkbox"}
        checked={checked}
        onChange={
          onChange
            ? (ev) => {
                onChange()(ev);
              }
            : undefined
        }
        disabled={disabled}
        value={value}
      />
      <svg
        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-primary-foreground group-has-[:disabled]:stroke-muted-foreground/50"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          className="opacity-0 group-has-[:checked]:opacity-100"
          d="M3 8L6 11L11 3.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="opacity-0 group-has-[:indeterminate]:opacity-100"
          d="M3 7H11"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
