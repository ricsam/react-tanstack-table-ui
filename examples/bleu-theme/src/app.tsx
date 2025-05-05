import { AutoSizer, ReactTanstackTableUi } from "@rttui/core";
import { BleuSkin } from "@rttui/skin-bleu";
import { useTable } from "./use_table";
import { Box } from "@mui/material";

export function App() {
  const table = useTable();

  return (
    <AutoSizer
      style={{ flex: 1 }}
      adaptTableToContainer={{
        width: true,
        height: true,
      }}
    >
      <ReactTanstackTableUi
        table={table}
        skin={BleuSkin}
        renderSubComponent={(row) => {
          return (
            <Box
              component="pre"
              sx={{
                fontSize: "10px",
                textAlign: "left",
                px: 1,
                py: 0,
              }}
            >
              <code>{JSON.stringify(row.original, null, 2)}</code>
            </Box>
          );
        }}
      />
    </AutoSizer>
  );
}
