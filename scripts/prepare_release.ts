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

  for (const [type, extension] of [
    ["es6", "mjs"],
    ["commonjs", "cjs"],
  ] as const) {
    await Bun.write(
      path.join(packageDir, `.swcrc.${extension}.json`),
      JSON.stringify(
        {
          $schema: "https://swc.rs/schema.json",
          module: {
            type,
            outFileExtension: extension,
          },
          jsc: {
            target: "esnext",
            parser: {
              syntax: "typescript",
            },
          },
        },
        null,
        2,
      ),
    );
  }

  const runTsc = async (tsconfig: string) => {
    const { stdout, stderr, exitCode } = await $`pnpm exec tsc -p ${tsconfig}`
      .cwd(packageDir)
      .nothrow();

    if (exitCode !== 0) {
      console.error(stderr.toString());
      console.log(stdout.toString());
      return false;
    }
    const output = stdout.toString();
    if (output.trim() !== "") {
      console.log(output);
    }
    return true;
  };
  const runSwc = async (swcrc: string, outDir: string, extension: string) => {
    const { stdout, stderr, exitCode } =
      await $`pnpm exec swc ./src --config-file ${swcrc} --out-dir ${outDir} --out-file-extension ${extension} -s --ignore '**/*.test.ts' --strip-leading-paths`
        .cwd(packageDir)
        .nothrow();

    if (exitCode !== 0) {
      console.error(stderr.toString());
      console.log(stdout.toString());
      return false;
    }
    const output = stdout.toString();
    if (output.trim() !== "") {
      console.log(output);
    }
    return true;
  };

  const runBunBundle = async (type: "cjs" | "mjs") => {
    let entryPoint: string | undefined;
    for (const ext of [".ts", ".tsx"]) {
      if (await Bun.file(path.join(packageDir, "src", "index" + ext)).exists()) {
        entryPoint = ext;
        break;
      }
    }
    if (!entryPoint) {
      throw new Error("No entry point found");
    }
    await Bun.build({
      entrypoints: [path.join(packageDir, "src", "index" + entryPoint)],
      outdir: path.join(packageDir, "dist", type),
      minify: false,
      sourcemap: "external",
      format: type === "mjs" ? "esm" : "cjs",
      external: [
        "react",
        "react-dom",
        "@tanstack/react-table",
        "@tanstack/react-virtual",
        "@mui/material",
        "@mui/icons-material",
        "@rttui/core",
      ],
    });
    return true;
  };

  await $`rm -rf dist`.cwd(packageDir);

  const success = (
    await Promise.all([
      // runSwc(".swcrc.mjs.json", "dist/mjs", "mjs"),
      // runSwc(".swcrc.cjs.json", "dist/cjs", "cjs"),
      runBunBundle("mjs"),
      runBunBundle("cjs"),
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
