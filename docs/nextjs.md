# Next.js Guidelines

## App Router Structure
```
src/app/
├── [locale]/           # i18n routing
│   ├── layout.tsx      # Locale layout
│   ├── page.tsx       # Homepage
│   └── */page.tsx     # Route pages
├── api/               # API routes
│   └── */route.ts     # Route handlers
└── globals.css        # Global styles
```

## Server vs Client Components
- Default to Server Components
- Add `'use client'` only when needed (hooks, browser APIs)
- Minimize client-side JavaScript

## Data Fetching
- Use React Server Components for data fetching
- Use server actions for mutations
- Handle loading/error states with Suspense and error boundaries

## i18n
- Use `next-intl` for internationalization
- Define messages in `messages/` directory
- Use `useTranslations` hook in client components