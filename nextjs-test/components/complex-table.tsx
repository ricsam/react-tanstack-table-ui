"use client";
import { cn } from "@/lib/utils";
import { useTable } from "@/hooks/use-table";
import { Skin } from "@/components/rttui-skin";
import { AutoSizer, ReactTanstackTableUi } from "@rttui/core";

export function ComplexTable({ className }: { className?: string }) {
  const table = useTable();

  return (
    <div className={cn("h-full w-full", className)}>
      <AutoSizer
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
        }}
        adaptContainerToTable={{ width: false, height: false }}
        adaptTableToContainer={{ width: true, height: true }}
        initialWidth={800}
        initialHeight={600}
      >
        <ReactTanstackTableUi
          table={table}
          skin={Skin}
          autoCrushNumCols={50}
          autoCrushMaxSize={300}
        />
      </AutoSizer>
    </div>
  );
}
