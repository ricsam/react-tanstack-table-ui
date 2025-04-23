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
    console.log(
      `Typescript for ${tsconfig} compiled successfully and produced output in`,
      path.relative(process.cwd(), path.join(packageDir, "dist", "types")),
    );
    return true;
  };

  const runBunBundleRec = async (type: "cjs" | "mjs") => {
    const tsGlob = new Glob("**/*.{ts,tsx}");
    for await (const file of tsGlob.scan({
      cwd: path.join(packageDir, "src"),
    })) {
      const result = await Bun.build({
        entrypoints: [path.join(packageDir, "src", file)],
        outdir: path.join(packageDir, "dist", type, path.dirname(file)),
        sourcemap: "external",
        format: type === "mjs" ? "esm" : "cjs",
        packages: "external",
        external: ["*"],
        naming: `[name].${type}`,
        target: "browser",
        plugins: [
          {
            name: "extension-plugin",
            setup(build) {
              build.onLoad(
                { filter: /\.tsx?$/, namespace: "file" },
                async (args) => {
                  let content = await Bun.file(args.path).text();
                  const extension = type;
                  content = content.replace(
                    /(im|ex)port\s[\w{}/*\s,]+from\s['"](?:\.\.?\/)+?[^.'"]+(?=['"];?)/gm,
                    `$&.${extension}`,
                  );

                  // replace e.g. `import('./foo')` with `import('./foo.js')`
                  content = content.replace(
                    /import\(['"](?:\.\.?\/)+?[^.'"]+(?=['"];?)/gm,
                    `$&.${extension}`,
                  );

                  return {
                    contents: content,
                    loader: args.path.endsWith(".tsx") ? "tsx" : "ts",
                  };
                },
              );
            },
          },
        ],
      });
      result.logs.forEach((log) => {
        console.log(`[${log.level}] ${log.message}`);
      });
    }

    console.log(
      "Bun bundle created successfully and produced output in",
      path.relative(process.cwd(), path.join(packageDir, "dist", type)),
    );

    return true;
  };

  await $`rm -rf dist`.cwd(packageDir);

  const success = (
    await Promise.all([
      runBunBundleRec("mjs"),
      runBunBundleRec("cjs"),
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
  delete packageJson.type;
  Object.assign(packageJson, {
    main: "./dist/cjs/index.cjs",
    module: "./dist/mjs/index.mjs",
    types: "./dist/types/index.d.ts",
    exports: {
      ".": {
        types: "./dist/types/index.d.ts",
        require: "./dist/cjs/index.cjs",
        import: "./dist/mjs/index.mjs",
      },
    },
    publishConfig: {
      access: "public",
    },
    files: ["dist"],
  });

  await Bun.write(
    path.join(packageDir, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  console.log("Finished compiling", path.basename(packageDir), version + "\n");
}
