import { ExampleLayout } from "@/components/ExampleLayout";

export function BasicExample() {
  const example = {
    title: "Basic Table Example",
    description:
      "A simple table with basic functionality showing how to get started with React TanStack Table UI.",
    stackblitzUrl:
      "https://stackblitz.com/github/ricsam/virtualized-table/tree/main/examples/minimal?embed=1&theme=dark&preset=node&file=src/app.tsx",
    codesandboxUrl:
      "https://codesandbox.io/p/devbox/github/ricsam/virtualized-table/tree/main/examples/minimal",
  };

  return <ExampleLayout {...example} />;
}
