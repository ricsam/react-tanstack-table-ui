import { createFileRoute } from "@tanstack/react-router";
import BleuReadme, {
  tableOfContents,
} from "~packages/skin-bleu/README.md";

export const Route = createFileRoute("/skins/bleu/")({
  component: BleuReadme,
  staticData: {
    tableOfContents,
  },
});
