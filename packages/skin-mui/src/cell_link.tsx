import React from "react";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";

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
    <Link
      href={href}
      sx={{
        fontSize: "0.875rem", // text-sm
        fontWeight: 500, // font-medium
        color: "primary.main", // indigo-600
        "&:hover": {
          color: "primary.dark", // indigo-900
        },
      }}
      {...props}
    >
      {children}
      {srText && (
        <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          , {srText}
        </Box>
      )}
    </Link>
  );
}; 