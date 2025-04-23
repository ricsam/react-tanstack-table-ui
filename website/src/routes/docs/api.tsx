import { createFileRoute } from "@tanstack/react-router";
import API, { tableOfContents } from "~docs/API.md";

export const Route = createFileRoute("/docs/api")({
  component: API,
  staticData: {
    tableOfContents,
  },
});
