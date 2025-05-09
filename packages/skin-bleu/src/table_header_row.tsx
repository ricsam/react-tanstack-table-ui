import { TableRow } from "@mui/material";

export function TableHeaderRow({ children }: { children: React.ReactNode }) {
  return (
    <TableRow
      component="div"
      sx={{
        height: "var(--row-height)",
        display: "flex",
        willChange: "contents",
        borderBottom: "none",
        borderTop: "none",
      }}
    >
      {children}
    </TableRow>
  );
}
