import { createFileRoute } from "@tanstack/react-router";
import TailwindReadme, {
  tableOfContents,
} from "~packages/skin-tailwind/README.md";

export const Route = createFileRoute("/skins/tailwind/")({
  component: TailwindReadme,
  staticData: {
    tableOfContents,
  },
});
