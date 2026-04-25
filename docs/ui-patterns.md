# UI & Styling

## Framework

- **Styling**: Tailwind CSS 4 with `@tailwindcss/postcss`
- **Animations**: Framer Motion for transitions and motion effects
- **Dark mode**: `darkMode: "class"` in tailwind.config.ts

## Component Organization

```
components/
├── UI/          # Reusable primitives (Button, Popup)
├── Layout/      # Structural (Header, Menu, LoadingComponent, Toast)
├── Auth/        # Auth wrapper (AuthProvider)
├── Words/       # Vocabulary features (WordCard, WordList, WordForm, ShowLearningFlag)
├── Quiz/        # Quiz features (QuizView, QuizFinished)
├── AI/          # AI generation UI (AiQuizGenerator, AiGenerateVocabulary)
├── Settings/    # Settings panel (NativeLanguage, LanguageToLearn, DeleteAccount, ThemeSwitcher)
├── Onboarding/  # First-run flow (AddFirstCards, LocaleSwitcher, LanguageLearningOnboarding)
└── Icons/       # SVG icon components (flag icons, action icons, logos)
```

## Component Patterns

- **Pages**: default exports in `src/app/[locale]/page.tsx`
- **Components**: named exports, PascalCase filenames
- **Context providers**: `context/` directory, each wraps `createContext` + provider + custom hook
- **Hooks**: `hooks/` directory, prefixed with `use` (e.g. `useQuizManager`, `useTextToSpeech`, `useLocalStorage`)
- **Composition over configuration**: use `children` props for flexible layouts

## Context Architecture

All contexts live in `context/` and follow this pattern:

1. Define `XxxContextType` interface
2. Create context with default values
3. Export `XxxProvider` component
4. Export `useXxx` custom hook via `useContext`

Contexts in the app: `QuizContext`, `WordsContext`, `LanguageToLearnContext`, `ToastContext`

All providers are composed in `src/app/providers.tsx`

## Tailwind Conventions

- Utility classes for one-off styles
- Extract repeated patterns into components (not CSS classes)
- `globals.css` for base styles and CSS variables
