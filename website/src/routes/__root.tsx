/* eslint-disable filenames-simple/naming-convention */
import { RootLayout } from "@/layouts/root_layout";
import { createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootLayout,
});
