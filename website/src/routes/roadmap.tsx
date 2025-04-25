import { createFileRoute } from "@tanstack/react-router";
import Roadmap, { tableOfContents } from "~docs/ROADMAP.md";

export const Route = createFileRoute("/roadmap")({
  component: Roadmap,
  staticData: {
    tableOfContents,
  },
});
