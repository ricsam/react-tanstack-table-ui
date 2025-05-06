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
        adaptTableToContainer={{ width: true, height: true }}
        adaptContainerToTable={{ width: false, height: false }}
        initialWidth={800}
        initialHeight={600}
      >
        <ReactTanstackTableUi
          table={table as any}
          skin={Skin}
          autoCrushNumCols={50}
          autoCrushMaxSize={300}
        />
      </AutoSizer>
    </div>
  );
}
