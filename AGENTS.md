# AGENTS.md

Vocabulary learning app with AI-powered quizzes, spaced repetition, and level-based progression.

## Must Know

- **Package manager**: pnpm
- **Dev server**: `pnpm dev` (uses Turbopack)
- **Pre-commit hook**: `pnpm test` runs automatically before every commit — tests must pass
- **AI model**: `AI_MODEL` env var (defaults to `gemini-2.5-flash`)
- **Locales**: `en` `de` `zh` `es` `ru` → mapped to `English` `Deutsch` `中文` `Español` `русский`

## Details by Topic

- [AI Generation](docs/ai-generation.md) — dual-provider pattern, prompt architecture, quiz/word generation
- [TypeScript Conventions](docs/typescript.md) — types, interfaces, Language/Locale unions
- [Testing Patterns](docs/testing.md) — Jest, colocated tests, next-intl mock pattern
- [Next.js Guidelines](docs/nextjs.md) — App Router, locale routing, API routes, DB connection
- [UI & Styling](docs/ui-patterns.md) — Tailwind CSS 4, Framer Motion, component organization
- [Data Models](docs/data-models.md) — Mongoose schemas, SRS fields, indexes, MongoDB caching
- [Git Workflow](docs/git-workflow.md) — branch rules, pre-commit gate
- [Internationalization](docs/i18n.md) — locale/language mapping, next-intl, translation files
