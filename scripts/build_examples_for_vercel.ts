import { $, Glob } from "bun";
import path from "path";
const glob = new Glob("examples/*/package.json");

for await (const pkg of glob.scan({ absolute: true })) {
  const packageJson = JSON.parse(await Bun.file(pkg).text());
  const base = "/static_examples/" + path.basename(path.dirname(pkg));
  packageJson.viteBase = base;
  await Bun.write(pkg, JSON.stringify(packageJson, null, 2));
  console.log("building example", path.dirname(pkg));
  await $`
    pnpm run build
  `.cwd(path.dirname(pkg));
  const websiteDir = path.join(process.cwd(), "website", "public", base);
  console.log("copying example to website", path.relative(process.cwd(), websiteDir));
  await $`
    mkdir -p ${websiteDir}
    cp -r dist/* ${websiteDir}
  `.cwd(path.dirname(pkg));
}


// build storybook for skins
{
  const packageDir = path.resolve(process.cwd(), "storybook");
  const base = "/static_sb/skins";

  const packageJsonPath = path.join(packageDir, "package.json");
  const packageJson = JSON.parse(await Bun.file(packageJsonPath).text());
  packageJson.viteBase = base;
  await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log("building skin storybook");

  await $`
    pnpm run build-storybook
  `.cwd(packageDir);

  const websiteDir = path.join(process.cwd(), "website", "public", base);
  console.log(
    "copying skin storybook to website",
    path.relative(process.cwd(), websiteDir),
  );
  await $`
    mkdir -p ${websiteDir}
    cp -r storybook-static/* ${websiteDir}
  `.cwd(packageDir);
}
