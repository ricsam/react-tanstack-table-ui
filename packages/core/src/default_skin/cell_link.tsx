import React from "react";

export type CellLinkProps = {
  href: string;
  children: React.ReactNode;
  srText?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const CellLink: React.FC<CellLinkProps> = ({
  href,
  children,
  srText,
  ...props
}) => {
  return (
    <a
      href={href}
      style={{
        fontSize: "var(--table-text-size, 0.875rem)",
        fontWeight: "var(--table-bold-weight, 500)",
        color: "var(--table-link-color, #4f46e5)",
        textDecoration: "none",
      }}
      {...props}
    >
      {children}
      {srText && (
        <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          , {srText}
        </span>
      )}
    </a>
  );
}; 