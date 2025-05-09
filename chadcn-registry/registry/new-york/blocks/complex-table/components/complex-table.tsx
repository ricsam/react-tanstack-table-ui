"use client";
import { cn } from "@/lib/utils";
import { useTable } from "@/registry/new-york/blocks/complex-table/hooks/use-table";
import { RttuiChadcnSkin } from "@/registry/new-york/rttui/rttui-skin";
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
          skin={RttuiChadcnSkin}
          autoCrushNumCols={50}
          autoCrushMaxSize={300}
          renderSubComponent={(row) => {
            return (
              <pre className="text-xs text-left px-1 py-0">
                <code>{JSON.stringify(row.original, null, 2)}</code>
              </pre>
            );
          }}
        />
      </AutoSizer>
    </div>
  );
}
