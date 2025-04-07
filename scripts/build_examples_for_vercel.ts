import { $, Glob } from "bun";
import path from "path";
// const glob = new Glob("examples/*/package.json");

// for await (const pkg of glob.scan({ absolute: true })) {
//   const packageJson = JSON.parse(await Bun.file(pkg).text());
//   const base = "/static_examples/" + path.basename(path.dirname(pkg));
//   packageJson.viteBase = base;
//   await Bun.write(pkg, JSON.stringify(packageJson, null, 2));
//   console.log("building example", path.dirname(pkg));
//   await $`
//     pnpm run build
//   `.cwd(path.dirname(pkg));
//   const websiteDir = path.join(process.cwd(), "website", "public", base);
//   console.log("copying example to website", path.relative(process.cwd(), websiteDir));
//   await $`
//     mkdir -p ${websiteDir}
//     cp -r dist/* ${websiteDir}
//   `.cwd(path.dirname(pkg));
// }

const skinStorybookGlob = new Glob("packages/skin-*/.storybook/main.ts");
for await (const storybook of skinStorybookGlob.scan({
  absolute: true,
  dot: true,
})) {
  const packageDir = path.resolve(path.dirname(storybook), "..");
  const base = "/static_sb/" + path.basename(packageDir);

  console.log("building skin storybook", path.dirname(storybook));

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
