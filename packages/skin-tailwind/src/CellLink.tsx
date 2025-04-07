import React from "react";

type Props = {
  href: string;
  children: React.ReactNode;
  srText?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const CellLink: React.FC<Props> = ({
  href,
  children,
  srText,
  ...props
}) => {
  return (
    <a
      href={href}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
      {...props}
    >
      {children}
      {srText && <span className="sr-only">, {srText}</span>}
    </a>
  );
};
