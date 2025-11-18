import { examples } from "@/data/examples";
import { PreviewExample } from "@/components/examples/preview_example";
import {
  createFileRoute,
  createRoute,
  Outlet,
} from "@tanstack/react-router";

export const Route = createFileRoute("/preview")({
  component: RouteComponent,
  staticData: {
    layout: "full",
  },
});

function RouteComponent() {
  return <Outlet />;
}

// Create preview routes dynamically based on the examples data
const previewRoutes = Object.values(examples).map((example) => {
  return createRoute({
    getParentRoute: () => Route,
    path: `/${example.id}`,
    component: PreviewExample,
    staticData: {
      example: {
        id: example.id,
        title: example.title,
        description: example.description,
        dirName: example.dirName,
        mainFile: example.mainFile,
      },
      layout: "full",
    },
  });
});

Route.addChildren(previewRoutes);

