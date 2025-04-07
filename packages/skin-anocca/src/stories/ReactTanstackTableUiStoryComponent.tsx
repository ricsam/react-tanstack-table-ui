import { ScopedCssBaseline, ThemeProvider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ReactTanstackTableUi as Table } from "@rttui/core";
import { TableOptions, useReactTable } from "@tanstack/react-table";

export const ReactTanstackTableUi = ({
  tableOptions,
  uiOptions,
}: {
  tableOptions: TableOptions<any>;
  uiOptions: Omit<React.ComponentProps<typeof Table>, "table">;
}) => {
  const table = useReactTable(tableOptions);
  const theme = useTheme();

  return (
    <ScopedCssBaseline>
      <ThemeProvider theme={theme}>
        <Table table={table} {...uiOptions} />
      </ThemeProvider>
    </ScopedCssBaseline>
  );
};
