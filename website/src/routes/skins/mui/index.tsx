import { createFileRoute } from "@tanstack/react-router";
import MuiReadme, {
  tableOfContents,
} from "~packages/skin-mui/README.md";

export const Route = createFileRoute("/skins/mui/")({
  component: MuiReadme,
  staticData: {
    tableOfContents,
  },
});
