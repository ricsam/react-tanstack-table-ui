import { cn } from "@/lib/utils";
import { ComplexTable } from "@/components/complex-table";

export default function Page() {
  const theme =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  return (
    <div
      className={cn("relative w-screen h-screen", theme === "dark" && "dark")}
    >
      <ComplexTable className="absolute inset-0 p-6 bg-background" />
    </div>
  );
}
