import { StorybookEmbed } from "@/components/storybook/storybook_embed";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/skins/default/storybook")({
  component: RouteComponent,
  staticData: {
    layout: "full",
  },
});

function RouteComponent() {
  return (
    <StorybookEmbed skin="core" />
  );
}
