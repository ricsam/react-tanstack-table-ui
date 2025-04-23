/* eslint-disable filenames-simple/naming-convention */

import { createFileRoute } from "@tanstack/react-router";
import GettingStarted, { tableOfContents } from "~docs/GETTING_STARTED.md";

export const Route = createFileRoute("/docs/getting-started")({
  component: GettingStarted,
  staticData: {
    tableOfContents,
  },
});
