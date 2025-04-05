import { DocsLayout } from "@/layouts/DocsLayout";
import { RootLayout } from "@/layouts/RootLayout";
import { APIPage } from "@/pages/api/Index";
import { GettingStartedPage } from "@/pages/docs/GettingStarted";
import { DocsIndexPage } from "@/pages/docs/Index";
import { InstallationPage } from "@/pages/docs/Installation";
import { QuickStartPage } from "@/pages/docs/QuickStart";
import { ExamplesPage } from "@/pages/examples/Index";
import { StaticExample } from "@/pages/examples/StaticExample";
import { HomePage } from "@/pages/Home";
import { createRootRoute, createRoute } from "@tanstack/react-router";

// Root route with the main layout
export const rootRoute = createRootRoute({
  component: RootLayout,
});

// Home page
export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Docs layout route
export const docsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "docs",
  component: DocsLayout,
});

// Docs index page
export const docsIndexRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "/",
  component: DocsIndexPage,
});

// Getting started page
export const gettingStartedRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "getting-started",
  component: GettingStartedPage,
});

// Installation page
export const installationRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "installation",
  component: InstallationPage,
});

// Quick start page
export const quickStartRoute = createRoute({
  getParentRoute: () => docsRoute,
  path: "quickstart",
  component: QuickStartPage,
});

// Examples index page
export const examplesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples",
  component: ExamplesPage,
});

export const fullExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples/full",
  component: StaticExample,
  staticData: {
    example: {
      title: "Full Example",
      description: "A full example of how to use the library.",
      dirName: "full",
      mainFile: "src/app.tsx",
    },
  },
});

export const minimalExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples/minimal",
  component: StaticExample,
  staticData: {
    example: {
      title: "Minimal Example",
      description: "A minimal example of how to use the library.",
      dirName: "minimal",
      mainFile: "src/app.tsx",
    },
  },
});

export const skinsExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples/skins",
  staticData: {
    example: {
      title: "Custom Skins Example",
      description:
        "Explore different skin options including Material UI and Anocca themes.",
      dirName: "skins",
      mainFile: "src/app.tsx",
    },
  },
  component: StaticExample,
});

export const smallExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "examples/small",
  component: StaticExample,
  staticData: {
    example: {
      title: "Small Example",
      description: "A small example of how to use the library.",
      dirName: "small",
      mainFile: "src/app.tsx",
    },
  },
});

// API reference page
export const apiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "api",
  component: APIPage,
});

// Create the route tree using the routes
export const routeTree = rootRoute.addChildren([
  homeRoute,
  docsRoute.addChildren([
    docsIndexRoute,
    gettingStartedRoute,
    installationRoute,
    quickStartRoute,
  ]),
  examplesRoute,
  fullExampleRoute,
  minimalExampleRoute,
  smallExampleRoute,
  skinsExampleRoute,
  apiRoute,
]);
