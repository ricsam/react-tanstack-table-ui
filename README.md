# React TanStack Table UI

https://stackblitz.com/github/ricsam/virtualized-table/tree/main/examples/full?embed=1&theme=dark&preset=node&file=src/app.tsx

https://codesandbox.io/p/devbox/github/ricsam/virtualized-table/tree/main/examples/full?embed=1&theme=dark&file=src/app.tsx


# Repository structure

## Scripts
* `link_lib_to_examples.ts` after running pnpm install, we will have the published package from npm in the examples node_modules folder. To test the examples while developing the main packages the react-tanstack-table-ui folders needs to be removed from node_modules and replaced by a symlink to the packages/react-tanstack-table-ui folder

## Packages
The packages published to npm. The package.json files are adapted for development. When publishing new package.json files are generated for npm.

## Examples
These are consumed by stackblitz and are thus static in the tsconfig and package.json