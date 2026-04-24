# Git Workflow

## Pre-commit Hook

Husky runs `pnpm test` **before every commit**. If any test fails, the commit is aborted. You cannot commit without passing tests.

Note: `pnpm lint` does **not** run on pre-commit — only `pnpm test`.

## Branch Naming

- `feature/` — new features
- `fix/` — bug fixes
- `refactor/` — code improvements
- `docs/` — documentation only

## Commit Messages

- First line: brief summary (50 chars max)
- Body: explanation (wrap at 72 chars)
- Reference issues/tickets: "Closes #123"

## Pull Requests

- Keep PRs focused on a single concern
- Include description of changes
- Link related issues
- Request review before merging
