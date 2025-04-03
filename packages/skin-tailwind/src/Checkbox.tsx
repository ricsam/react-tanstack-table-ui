import React, { useRef, RefObject, useLayoutEffect } from "react";


export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, indeterminate, onChange, disabled, value, className = "" }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const resolvedRef = (ref || internalRef) as RefObject<HTMLInputElement>;

    useLayoutEffect(() => {
      if (resolvedRef.current) {
        resolvedRef.current.indeterminate = !!indeterminate;
      }
    }, [resolvedRef, indeterminate]);

    return (
      <div className="group grid size-4 grid-cols-1">
        <input
          type="checkbox"
          className={`col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto ${className}`}
          ref={resolvedRef}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          value={value} />
        <svg
          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            className="opacity-0 group-has-[:checked]:opacity-100"
            d="M3 8L6 11L11 3.5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round" />
          <path
            className="opacity-0 group-has-[:indeterminate]:opacity-100"
            d="M3 7H11"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round" />
        </svg>
      </div>
    );
  }
);
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  value?: string;
  className?: string;
}
