import { createFileRoute } from "@tanstack/react-router";
import DefaultReadme, {
  tableOfContents,
} from "~packages/core/src/default_skin/README.md";

export const Route = createFileRoute("/skins/default/")({
  component: DefaultReadme,
  staticData: {
    tableOfContents,
  },
});
