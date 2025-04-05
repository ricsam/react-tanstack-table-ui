import { $, Glob } from "bun";
import path from "path";
const glob = new Glob("examples/*/package.json");

for await (const pkg of glob.scan({ absolute: true })) {
  const packageJson = JSON.parse(await Bun.file(pkg).text());
  const base = "/static_examples/" + path.basename(path.dirname(pkg));
  packageJson.viteBase = base;
  await Bun.write(pkg, JSON.stringify(packageJson, null, 2));
  await $`
    pnpm run build
  `.cwd(path.dirname(pkg));
  const websiteDir = path.join(process.cwd(), "website", "public", base);
  await $`
    mkdir -p ${websiteDir}
    cp -r dist/* ${websiteDir}
  `.cwd(path.dirname(pkg));
}
