---
name: dead-code-removal
description: Detects and safely removes unused files, components, functions, variables, imports, exports, dependencies, routes, styles, and other dead code from TypeScript, JavaScript, React, and Next.js projects. Use when the user asks to find dead code, clean unused code, remove unused files, remove unused dependencies, or refactor the project.
---

# Dead Code Removal

Safely identify and remove dead code without changing application behavior.

## Core principle

Never delete code only because it appears unused.

Before deleting anything:

1. Detect potential dead code.
2. Search the entire project for references.
3. Check framework-specific implicit usage.
4. Classify the confidence level.
5. Remove only code that is safe to remove.
6. Run validation after removal.

## Workflow

### 1. Understand the project

Before making changes, inspect:

- package.json
- tsconfig.json / jsconfig.json
- next.config.*
- src/
- app/
- components/
- lib/
- utils/
- hooks/
- services/
- styles/
- public/

Determine whether the project uses:

- Next.js App Router
- Next.js Pages Router
- React
- TypeScript
- JavaScript
- Prisma
- Tailwind CSS
- CSS Modules
- ESLint

Do not assume the framework structure.

### 2. Detect candidates

Look for:

- unused imports
- unused variables
- unused functions
- unused React components
- unused hooks
- unused utility functions
- unused exports
- unused TypeScript types/interfaces
- unused files
- unused CSS classes
- unused dependencies
- duplicate utilities
- unreachable code

### 3. Search before deleting

Before deleting a function, component, export, or file, search the entire repository.

Check:

- direct imports
- dynamic imports
- barrel exports
- re-exports
- aliases such as @/
- lazy loading
- configuration references
- string-based references

Example:

A component that has no obvious import may still be loaded using:

```ts
dynamic(() => import("@/components/MyComponent"))