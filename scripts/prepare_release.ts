import { Glob } from "bun";
import path from "path";

const glob = new Glob("*/package.json");

const projectRoot = path.join(__dirname, "../");
const packagesDir = path.join(projectRoot, "packages");

for await (const file of glob.scan({ cwd: packagesDir, absolute: true })) {
  const packageDir = path.dirname(file);
  const packageJson = await Bun.file(
    path.join(packageDir, "package.json"),
  ).json();

  const version = packageJson.version;

  console.log(version);
}
