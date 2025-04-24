import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import mdx from "@mdx-js/rollup";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import withSlugs from "rehype-slug";
import withToc from "@stefanprobst/rehype-extract-toc";
import withTocExport from "@stefanprobst/rehype-extract-toc/mdx";
import remarkGfm from "remark-gfm";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    mdx({
      providerImportSource: "@mdx-js/react",
      mdxExtensions: [".mdx", ".md"],
      mdExtensions: [],
      rehypePlugins: [
        withSlugs,
        withToc,
        withTocExport,
        /** Optionally, provide a custom name for the export. */
        // [withTocExport, { name: 'toc' }],
      ],
      remarkPlugins: [remarkGfm],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "~docs": path.resolve(__dirname, "../docs"),
      "~packages": path.resolve(__dirname, "../packages"),
      "@mdx-js/react": path.resolve(__dirname, "./node_modules/@mdx-js/react"),
    },
  },
});
