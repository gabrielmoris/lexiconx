# AGENTS.md

Lexiconx is an AI-powered vocabulary quiz app for language learning (Next.js 15 App Router, React 19, MongoDB), with AI-generated quizzes, spaced repetition, and a 5-locale UI.

## Essentials

- **Package manager: pnpm** (not npm). Use `pnpm install`, `pnpm <script>`.
- **Run pnpm/node commands inside WSL** (the repo lives on the WSL filesystem; running pnpm from Windows corrupts `node_modules`).
- **Path alias:** `@/*` maps to the repo root (e.g. `@/lib/...`, `@/types/...`).
- **Pre-commit hook runs `format:check` → `lint` → `typecheck` → `test`** and aborts the commit if any fail. Keep all four green.

### Commands

| Task         | Command              | Notes                          |
| ------------ | -------------------- | ------------------------------ |
| Dev          | `pnpm dev`           | Next.js with `--turbopack`     |
| Build        | `pnpm build`         |                                |
| Lint         | `pnpm lint`          | `next lint`                    |
| Typecheck    | `pnpm typecheck`     | `tsc --noEmit`                 |
| Format       | `pnpm format`        | Prettier, writes in place      |
| Format check | `pnpm format:check`  | Prettier, no writes (CI/hook)  |
| Test         | `pnpm test`          | `vitest run` (one-shot)        |
| Test (TDD)   | `pnpm test:watch`    | `vitest`                       |

## Detailed guides

Read the relevant guide before working in that area:

- [Architecture & project layout](docs/architecture.md)
- [TypeScript & formatting conventions](docs/typescript-conventions.md)
- [API route handlers](docs/api-routes.md)
- [Database & Mongoose models](docs/database.md)
- [AI providers & prompts](docs/ai-providers.md)
- [Internationalization (next-intl)](docs/i18n.md)
- [Testing](docs/testing.md)
- [Git workflow](docs/git-workflow.md)
