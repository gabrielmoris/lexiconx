# TypeScript Conventions

## Type Locations

All shared types live in the `types/` directory at the project root:

- `types/Words.ts` — `Word`, `User`, `LearningProgress`, `Language`, `Locale`, `WordsGeneratorResponse`
- `types/Quiz.ts` — `Quiz`, `QuizQuestion`, `QuizAnswer`, `QuizGeneratorResponse`
- `types/User.ts` — User-related types

## Language & Locale Unions

These are the core union types that drive the entire app. They are **not** 1:1 mapped:

```typescript
export type Language = "中文" | "English" | "Deutsch" | "Español" | "русский";
export type Locale = "en" | "de" | "zh" | "es" | "ru";
```

The mapping between them is:

| Locale | Language |
|--------|----------|
| `en` | `English` |
| `de` | `Deutsch` |
| `zh` | `中文` |
| `es` | `Español` |
| `ru` | `русский` |

This mapping is used in API routes (`src/app/api/ai-quiz/route.ts`) via the `LANGUAGES` record.

## Path Aliases

`@/` maps to the project root (configured in `tsconfig.json` paths). Use `@/` for all imports from `types/`, `lib/`, `context/`, `hooks/`, `components/`.

## Interface Patterns

- Use `interface` for object shapes (e.g. `Quiz`, `Word`, `User`)
- Use `type` for unions and intersections (e.g. `Language`, `Locale`)
- API route request bodies are typed inline with `as` assertions when parsing `req.json()`
- Mongoose model types are defined separately from schema — the `Word` interface in `types/Words.ts` is the source of truth, the Mongoose schema in `lib/mongodb/models/word.ts` implements it

## Naming Conventions

- **Files**: kebab-case (e.g. `generate-quiz.ts`, `quiz-prompts.ts`)
- **Components**: PascalCase (e.g. `QuizView.tsx`, `WordCard.tsx`)
- **Types/Interfaces**: PascalCase
- **Variables/functions**: camelCase
