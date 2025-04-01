# Packages

This directory contains all the packages published to npm under the `@rttui` scope.

## Available Packages

### Core (`@rttui/core`)

The core package provides the fundamental building blocks for creating virtualized tables with TanStack Table:

- Base components and hooks
- Virtualization utilities
- Type definitions
- Core functionality that all skins build upon

### Skin - Material UI (`@rttui/skin-mui`)

Material UI implementation of the TanStack Table UI components:

- Styled components using MUI
- Material Design compliant elements
- Seamless integration with existing MUI applications

### Skin - Anocca (`@rttui/skin-anocca`)

Anocca-themed implementation of the table components:

- Custom styling for Anocca brand requirements
- Specialized components for Anocca's use cases

### Fixtures (`@rttui/fixtures`)

Testing utilities and fixtures:

- Mock data generators
- Test helpers
- Common test scenarios

## Development

All packages use TypeScript and follow a consistent development pattern. Each package has its own:

- `package.json`
- TypeScript configuration
- Tests
- Build scripts

When developing locally, you can use the workspace linking features of pnpm to work on multiple packages simultaneously.

## Publishing

Packages are published to npm using Changesets and GitHub Actions. To publish a new version:

1. Make your changes
2. Run `pnpm changeset` to create a changeset
3. Push to GitHub
4. The GitHub Action will handle versioning and publishing 