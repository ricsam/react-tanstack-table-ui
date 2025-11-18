import { examples, examplesArray } from "@/data/examples";
import { StaticExample } from "@/components/examples/static_example";
import {
  createFileRoute,
  createRoute,
  Link,
  Outlet,
} from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute("/examples")({
  component: RouteComponent,
  staticData: {
    layout: "full",
  },
});

function RouteComponent() {
  return <Outlet />;
}

// Create example routes dynamically based on the examples data
const exampleRoutes = Object.values(examples).map((example) => {
  return createRoute({
    getParentRoute: () => Route,
    path: `/${example.id}`,
    component: StaticExample,
    staticData: {
      example: {
        id: example.id,
        title: example.title,
        description: example.description,
        dirName: example.dirName,
        mainFile: example.mainFile,
      },
    },
  });
});
Route.addChildren([
  createRoute({
    getParentRoute: () => Route,
    path: "/",
    component: LandingPage,
    staticData: {
      layout: "text",
    },
  }),
  ...exampleRoutes,
]);

function LandingPage() {
  return (
    <div>
      <h1>Examples</h1>
      <p>
        Browse through these examples to see React TanStack Table UI in action
        and learn how to implement various features in your own projects.
      </p>

      {examplesArray.map((example) => (
        <React.Fragment key={example.id}>
          <h2>
            <Link to={example.path}>{example.title}</Link>
          </h2>
          <p>{example.description}</p>
        </React.Fragment>
      ))}
    </div>
  );
}
