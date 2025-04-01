import { Glob } from "bun";
import fs from "fs";
import path from "path";

// Get all example directories
const pkgJsonGlob = new Glob("*/package.json");

const examplesDir = path.join(process.cwd(), "examples");
const packageDir = path.join(process.cwd(), "packages");

// For each example, remove the installed package and create symlink to local package
for await (const localPackage of pkgJsonGlob.scan({
  cwd: packageDir,
  absolute: true,
})) {
  for await (const example of pkgJsonGlob.scan({
    cwd: examplesDir,
    absolute: true,
  })) {
    const dirname = path.dirname(example);
    const nodeModulesPath = path.join(dirname, "node_modules");
    const localPackagePath = path.dirname(localPackage);
    const packageJsonPath = path.join(localPackagePath, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    const packageName = packageJson.name;

    const packagePath = path.join(nodeModulesPath, packageName);

    // Remove installed package if it exists
    if (fs.existsSync(packagePath)) {
      fs.rmSync(packagePath, { recursive: true, force: true });
    }

    fs.mkdirSync(path.dirname(packagePath), { recursive: true });

    // Create symlink to local package
    fs.symlinkSync(localPackagePath, packagePath, "junction");

    console.log(`Linked ${packageName} to ${path.basename(dirname)}`);
  }
}

console.log("All examples linked to local package");
