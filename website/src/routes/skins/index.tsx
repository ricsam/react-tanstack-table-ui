import { SkinsLandingPage } from "@/components/skins/skins_landing_page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/skins/")({
  component: SkinsLandingPage,
});
