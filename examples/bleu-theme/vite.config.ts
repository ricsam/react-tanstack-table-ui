import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

let base: undefined | string;

try {
  const packageJson = fs.readFileSync(
    path.join(__dirname, "package.json"),
    "utf-8",
  );
  const viteBase = JSON.parse(packageJson).viteBase;
  if (viteBase) {
    base = viteBase;
  }
} catch (e) {
  // ignore
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
});
