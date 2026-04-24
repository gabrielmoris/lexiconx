# Git Workflow

## Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- First line: brief summary (50 chars)
- Body: explanation (wrap at 72 chars)
- Reference issues/tickets: "Closes #123"

## Branch Naming
- `feature/` - new features
- `fix/` - bug fixes
- `refactor/` - code improvements
- `docs/` - documentation only

## Pull Requests
- Keep PRs focused on single concerns
- Include description of changes
- Link related issues
- Request review before merging

## Pre-commit Hooks
- Husky configured for commit linting
- Run `pnpm lint` and `pnpm test` before committing