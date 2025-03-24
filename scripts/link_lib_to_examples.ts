import fs from "fs";
import path from "path";

// Get all example directories
const examplesDir = path.join(process.cwd(), "examples");
const examples = fs.readdirSync(examplesDir);

const localPackages = fs.readdirSync(path.join(process.cwd(), "packages"));

// For each example, remove the installed package and create symlink to local package
for (const localPackage of localPackages) {
  for (const example of examples) {
    const nodeModulesPath = path.join(examplesDir, example, "node_modules");
    const localPackagePath = path.join(
      process.cwd(),
      "packages",
      localPackage,
    );
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

    console.log(`Linked ${packageName} to ${example}`);
  }
}

console.log("All examples linked to local package");
