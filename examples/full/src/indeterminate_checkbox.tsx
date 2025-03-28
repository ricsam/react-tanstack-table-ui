import React from "react";

export const IndeterminateCheckbox = React.memo(function IndeterminateCheckbox({
  indeterminate, className = "", ...rest
}: { indeterminate?: boolean; } & React.HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  React.useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate, rest.checked]);

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest} />
  );
});
