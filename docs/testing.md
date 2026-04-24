# Testing Patterns

## Framework
Jest with `@testing-library/react` and `@testing-library/jest-dom`

## Test File Location
- Co-locate tests with source files: `Component.test.tsx` alongside `Component.tsx`
- Integration tests in `__tests__/` directories

## Patterns
- Use `render` from `@testing-library/react`
- Use `userEvent` from `@testing-library/user-event` for interactions
- Use `jest.fn()` for mocking functions
- Use `expect().toBeInTheDocument()` for DOM assertions

## Coverage
- Aim for meaningful tests, not 100% coverage
- Prioritize testing logic over implementation details
- Mock external dependencies (APIs, databases)