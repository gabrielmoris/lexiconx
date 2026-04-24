# TypeScript Conventions

## Type Definitions
- Use explicit types over `any`
- Avoid type assertions unless necessary
- Define shared types in `types/` directory
- Use `interface` for object shapes, `type` for unions/intersections

## Naming
- PascalCase for types and interfaces
- camelCase for variables and functions
- kebab-case for file names

## Imports
- Use named exports unless default is more appropriate
- Group imports: external → internal → relative
- Use path aliases defined in tsconfig

## Null Handling
- Prefer `undefined` over `null` for optional values
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Enable strict null checks