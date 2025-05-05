import { lightModeVars, ReactTanstackTableUi } from "@rttui/core";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { expect, it } from "vitest";
import { render, renderHook } from "vitest-browser-react";

it("should render the component", async () => {
  const data = [
    {
      id: "1",
      name: "John",
    },
    {
      id: "2",
      name: "Jane",
    },
  ];
  const columnHelper = createColumnHelper<(typeof data)[number]>();
  function Cell({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  }

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      header: "Name",
      cell: (info) => <Cell>{info.getValue()}</Cell>,
    }),
  ];
  const { result } = renderHook(() => {
    return useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getRowId(originalRow) {
        return originalRow.id;
      },
      defaultColumn: {
        minSize: 60,
        maxSize: 800,
      },
      keepPinnedRows: true,
    });
  });

  const { getByText } = render(
    <div style={{ width: 600, height: 400, ...lightModeVars }}>
      <ReactTanstackTableUi
        table={result.current}
        width={600}
        height={400}
        autoCrushColumns={false}
      />
    </div>,
  );

  await expect.element(getByText("John")).toBeInTheDocument();
  await expect.element(getByText("Jane")).toBeInTheDocument();
});
