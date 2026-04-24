# Testing Patterns

## Framework & Config

- Jest with `next/jest` (see `jest.config.js`)
- `@testing-library/react` + `@testing-library/jest-dom`
- Coverage provider: v8
- `jest.setup.js` imports `@testing-library/jest-dom` matchers

## Test File Location

Tests are **colocated** with source files in `__tests__/` subdirectories:

```
components/Onboarding/__tests__/AddFirstCards.test.tsx
components/Settings/__tests__/LanguageToLearn.test.tsx
components/Settings/__tests__/DeleteAccount.test.tsx
```

## Critical: next-intl Mock

**Every test that renders a component using `useTranslations` must mock `next-intl`**. Use this exact pattern:

```typescript
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
```

Without this mock, tests fail because `next-intl` requires a provider context. The mock returns the translation key as the displayed text, so assertions use the key string (e.g. `screen.getByText("title")`).

## Mocking Child Components

Child components are mocked with `data-testid` for DOM assertions:

```typescript
jest.mock("../WordForm", () => {
  const MockWordForm = ({ className, isOpen }: { className?: string; isOpen?: boolean }) => {
    return <div data-testid="word-form">Word Form</div>;
  };
  return MockWordForm;
});
```

Then assert: `expect(screen.getByTestId("word-form")).toBeInTheDocument()`

## Coverage Configuration

Coverage is collected from `**/*.{js,jsx,ts,tsx}` excluding:
- `*.d.ts` files
- `node_modules/`, `out/`, `.next/`, `coverage/`
- Config files (`*.config.js`)

## Test Environment

- DOM environment via `jest-environment-jsdom`
- Babel transform with `next/babel` preset
- CSS modules are ignored in transforms
- Module alias: `@/` maps to `<rootDir>/` (matching tsconfig)
