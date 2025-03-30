import { $, Glob } from "bun";
import path from "path";

const examples = new Glob("examples/*/package.json");
const projectRoot = path.join(__dirname, "../");

const packages = new Glob("packages/*/package.json");
const packagesMap = new Map<string, string>();

for await (const pkg of packages.scan({
  cwd: projectRoot,
  absolute: true,
})) {
  const packageJson = await Bun.file(pkg).json();
  packagesMap.set(packageJson.name, packageJson.version);
}

console.log(
  "Updating examples with latest packages: ",
  Object.fromEntries(packagesMap),
);

for await (const example of examples.scan({
  cwd: projectRoot,
  absolute: true,
})) {
  console.log("Updating example:", path.basename(path.dirname(example)));
  const packageJson = await Bun.file(example).json();
  const dependencies = packageJson.dependencies;
  const devDependencies = packageJson.devDependencies;

  for (const deps of [dependencies, devDependencies]) {
    if (deps) {
      for (const dependency of Object.keys(deps)) {
        if (packagesMap.has(dependency)) {
          deps[dependency] = packagesMap.get(dependency);
        }
      }
    }
  }

  await Bun.write(example, JSON.stringify(packageJson, null, 2));
}
await $`pnpm install`.cwd(path.join(projectRoot, "examples"));
