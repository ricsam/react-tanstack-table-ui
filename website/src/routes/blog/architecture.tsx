import { createFileRoute } from "@tanstack/react-router";
import ArchitectureBlog, { tableOfContents } from "@/blog/architecture.mdx";

export const Route = createFileRoute("/blog/architecture")({
  component: ArchitectureBlog,
  staticData: {
    tableOfContents,
  },
});
