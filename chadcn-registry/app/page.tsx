import * as React from "react";
import { OpenInV0Button } from "@/components/open-in-v0-button";
import { ComplexTable } from "@/registry/new-york/blocks/complex-table/components/complex-table";
import { ModeToggle } from "@/components/mode-toggle";
import { CodeBlock } from "@/components/code-block";
// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  return (
    <div className="mx-auto flex flex-col min-h-svh px-4 py-8 gap-8 items-center pb-20">
      <header className="flex flex-row gap-1 w-full max-w-3xl">
        <div className="flex flex-col gap-1 w-full">
          <div className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight flex-1">
                React Tanstack Table UI with shadcn/ui
              </h1>

              <p className="text-muted-foreground">
                A complex table component with pagination, sorting, filtering,
                and more. Built with Tanstack Table and shadcn/ui components.
              </p>
            </div>
            <ModeToggle />
          </div>
          <div className="flex flex-wrap gap-4 pt-3">
            <a
              href="https://tanstack.com/table/latest/docs/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Tanstack Table Docs
            </a>
            <a
              href="https://rttui-docs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              React Tanstack Table UI Docs
            </a>
            <a
              href="https://ui.shadcn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              shadcn/ui Docs
            </a>
          </div>
          <CodeBlock
            className=""
            commands={{
              pnpm: "pnpm add @rttui/core",
              npm: "npm install @rttui/core",
              yarn: "yarn add @rttui/core",
              bun: "bun add @rttui/core",
            }}
          />
        </div>
      </header>
      <main className="flex flex-col flex-1 gap-8 w-full items-center">
        <div className="flex flex-col gap-6 border rounded-lg p-4 relative w-full items-center">
          <div className="flex items-center justify-between container max-w-3xl">
            <h2 className="text-lg font-bold text-foreground sm:pl-3">
              Complex Table
            </h2>
            <OpenInV0Button name="complex-table" className="w-fit" />
          </div>
          <div className="flex items-center justify-center min-h-[600px] relative flex-1 w-full">
            <ComplexTable className="absolute inset-0" />
          </div>
          <div className="w-full max-w-3xl">
            <h3 className="text-lg font-bold text-foreground">Installation:</h3>
            <CodeBlock
              commands={{
                pnpm: "pnpm dlx shadcn@latest add https://rttui-chadcn-registry.vercel.app/r/complex-table.json",
                npm: "npx shadcn@latest add https://rttui-chadcn-registry.vercel.app/r/complex-table.json",
                yarn: "yarn dlx shadcn@latest add https://rttui-chadcn-registry.vercel.app/r/complex-table.json",
                bun: "bunx --bun shadcn@latest add https://rttui-chadcn-registry.vercel.app/r/complex-table.json",
              }}
            />
          </div>
        </div>
        {/* 
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
        </div> */}
      </main>
    </div>
  );
}
