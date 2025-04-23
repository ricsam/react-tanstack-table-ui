import { examples } from "@/data/examples";
import { StaticExample } from "@/components/examples/static_example";
import { createFileRoute, createRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/examples")({
  component: RouteComponent,
  staticData: {
    layout: "full",
  },
});

function RouteComponent() {
  return <Outlet />
}

// Create example routes dynamically based on the examples data
const exampleRoutes = Object.values(examples).map((example) => {
  return createRoute({
    getParentRoute: () => Route,
    path: `/${example.id}`,
    component: StaticExample,
    staticData: {
      example: {
        title: example.title,
        description: example.description,
        dirName: example.dirName,
        mainFile: example.mainFile,
      },
    },
  });
});
Route.addChildren(exampleRoutes);
