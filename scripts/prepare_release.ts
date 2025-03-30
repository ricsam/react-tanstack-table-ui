import { $, Glob } from "bun";
import path from "path";

const glob = new Glob("*/package.json");

const projectRoot = path.join(__dirname, "../");
const packagesDir = path.join(projectRoot, "packages");

for await (const file of glob.scan({ cwd: packagesDir, absolute: true })) {
  const packageDir = path.dirname(file);
  console.log("Compiling", path.basename(packageDir));
  const packageJson = await Bun.file(
    path.join(packageDir, "package.json"),
  ).json();

  await Bun.write(
    path.join(packageDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          allowJs: true,
          allowSyntheticDefaultImports: true,
          baseUrl: "src",
          target: "ESNext",
          declaration: true,
          esModuleInterop: true,
          inlineSourceMap: false,
          lib: ["esnext", "dom"],
          listEmittedFiles: false,
          jsx: "react-jsx",
          listFiles: false,
          moduleResolution: "node",
          noFallthroughCasesInSwitch: true,
          pretty: true,
          resolveJsonModule: true,
          rootDir: "src",
          skipLibCheck: true,
          strict: true,
          traceResolution: false,
        },
        compileOnSave: false,
        exclude: ["node_modules", "dist"],
        include: ["src"],
      },
      null,
      2,
    ),
  );

  await Bun.write(
    path.join(packageDir, "tsconfig.mjs.json"),
    JSON.stringify(
      {
        extends: "./tsconfig.json",
        compilerOptions: {
          module: "preserve",
          outDir: "dist/mjs",
        },
      },
      null,
      2,
    ),
  );

  await Bun.write(
    path.join(packageDir, "tsconfig.cjs.json"),
    JSON.stringify(
      {
        extends: "./tsconfig.json",
        compilerOptions: {
          module: "commonjs",
          outDir: "dist/cjs",
        },
      },
      null,
      2,
    ),
  );

  await Bun.write(
    path.join(packageDir, "tsconfig.types.json"),
    JSON.stringify(
      {
        extends: "./tsconfig.json",
        compilerOptions: {
          declaration: true,
          outDir: "dist/types",
          emitDeclarationOnly: true,
          declarationDir: "dist/types",
        },
      },
      null,
      2,
    ),
  );

  const runTsc = async (tsconfig: string) => {
    const { stdout, stderr, exitCode } = await $`pnpm exec tsc -p ${tsconfig}`
      .cwd(packageDir)
      .nothrow();

    if (exitCode !== 0) {
      console.error(stderr.toString());
      console.log(stdout.toString());
      return false;
    } else {
      const output = stdout.toString();
      if (output.trim() !== "") {
        console.log(output);
      }
      return true;
    }
  };

  await $`rm -rf dist`.cwd(packageDir);

  const success = (
    await Promise.all([
      runTsc("tsconfig.mjs.json"),
      runTsc("tsconfig.cjs.json"),
      runTsc("tsconfig.types.json"),
    ])
  ).every((s) => s);

  if (!success) {
    throw new Error("Failed to compile");
  }

  const version = packageJson.version;

  for (const [folder, type] of [
    ["dist/cjs", "commonjs"],
    ["dist/mjs", "module"],
  ] as const) {
    await Bun.write(
      path.join(packageDir, folder, "package.json"),
      JSON.stringify(
        {
          name: packageJson.name,
          version,
          type,
        },
        null,
        2,
      ),
    );
  }

  delete packageJson.devDependencies;
  Object.assign(packageJson, {
    main: "./dist/cjs/index.js",
    module: "./dist/mjs/index.js",
    types: "./dist/types/index.d.ts",
    exports: {
      ".": {
        types: "./dist/types/index.d.ts",
        require: "./dist/cjs/index.js",
        import: "./dist/mjs/index.js",
      },
    },
    publishConfig: {
      access: "public",
    },
  });

  await Bun.write(
    path.join(packageDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  console.log("Finished compiling", path.basename(packageDir), version + "\n");
}
