import { TableRow } from "@mui/material";

export function TableHeaderRow({
  children,
  type,
}: {
  children: React.ReactNode;
  type: "header" | "footer";
}) {
  return (
    <TableRow
      component="div"
      sx={{
        height: "var(--row-height)",
        display: "flex",
        willChange: "contents",
        [type === "header" ? "borderBottom" : "borderTop"]: (theme) =>
          `1px solid ${theme.palette.divider}`,
      }}
    >
      {children}
    </TableRow>
  );
}
