import { ComplexTable } from "@/registry/new-york/blocks/complex-table/components/complex-table";

export default function Page() {
  return (
    <div className="relative w-screen h-screen">
      <ComplexTable className="absolute inset-0 p-6" />
    </div>
  );
}
