import * as React from "react";
import { OpenInV0Button } from "@/components/open-in-v0-button";
import { HelloWorld } from "@/registry/new-york/blocks/hello-world/hello-world";
import { ExampleForm } from "@/registry/new-york/blocks/example-form/example-form";
import PokemonPage from "@/registry/new-york/blocks/complex-component/page";
import { ComplexTable } from "@/registry/new-york/blocks/complex-table/components/complex-table";
import { ExampleCard } from "@/registry/new-york/blocks/example-with-css/example-card";
import { ModeToggle } from "@/components/mode-toggle";
// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  return (
    <div className="mx-auto flex flex-col min-h-svh px-4 py-8 gap-8 items-center">
      <header className="flex flex-row gap-1 w-full max-w-3xl">
        <div className="flex flex-col gap-1 w-full">
          <h1 className="text-3xl font-bold tracking-tight">Custom Registry</h1>
          <p className="text-muted-foreground">
            A custom registry for distributing code using shadcn.
          </p>
        </div>
        <ModeToggle />
      </header>
      <main className="flex flex-col flex-1 gap-8 w-full items-center">
        <div className="flex flex-col gap-4 border rounded-lg p-4 relative w-full">
          <div className="flex items-center justify-between container">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              Complex Table
            </h2>
            <OpenInV0Button name="complex-table" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[600px] relative">
            <ComplexTable className="absolute inset-0" />
          </div>
        </div>

        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              A simple hello world component
            </h2>
            <OpenInV0Button name="hello-world" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[400px] relative">
            <HelloWorld />
          </div>
        </div>

        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              A contact form with Zod validation.
            </h2>
            <OpenInV0Button name="example-form" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[500px] relative">
            <ExampleForm />
          </div>
        </div>

        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              A complex component showing hooks, libs and components.
            </h2>
            <OpenInV0Button name="complex-component" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[400px] relative">
            <PokemonPage />
          </div>
        </div>

        <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative w-full max-w-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm text-muted-foreground sm:pl-3">
              A login form with a CSS file.
            </h2>
            <OpenInV0Button name="example-with-css" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[400px] relative">
            <ExampleCard />
          </div>
        </div>
      </main>
    </div>
  );
}
