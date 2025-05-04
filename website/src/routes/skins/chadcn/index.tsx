import { createFileRoute } from "@tanstack/react-router";
import DefaultReadme, {
  tableOfContents,
} from "~chadcn-registry/README.md";

export const Route = createFileRoute("/skins/chadcn/")({
  component: DefaultReadme,
  staticData: {
    tableOfContents,
  },
});
