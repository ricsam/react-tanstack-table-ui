"use client";
import { AutoSizer, ReactTanstackTableUi } from "@rttui/core";
import { cn } from "@/lib/utils";
import { useTable } from "@/registry/new-york/blocks/complex-table/hooks/use-table";
import { Skin } from "@/registry/new-york/rttui/skin";

export function ComplexTable({ className }: { className?: string }) {
  const { table } = useTable();
  return (
    <div className={cn("h-full w-full", className)}>
      <AutoSizer
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
        }}
        adaptTableToContainer={{ width: true, height: true }}
      >
        <ReactTanstackTableUi table={table} skin={Skin} autoCrushNumCols={50} />
      </AutoSizer>
    </div>
  );
}
