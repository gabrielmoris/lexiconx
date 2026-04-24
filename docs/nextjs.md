# Next.js Guidelines

## App Router Structure

```
src/app/
├── [locale]/          # i18n routing (en, de, zh, es, ru)
│   ├── layout.tsx     # Locale layout (provides next-intl context)
│   ├── page.tsx       # Homepage
│   ├── quiz/          # Quiz page
│   ├── cards/         # Vocabulary cards page
│   ├── settings/      # Settings page
│   ├── stats/         # Stats page
│   ├── onboarding/    # Onboarding flow
│   ├── login/         # Auth page
│   ├── terms/         # Terms page
│   └── privacy/       # Privacy page
├── api/
│   ├── ai-quiz/route.ts    # Quiz generation endpoint
│   ├── ai-words/route.ts   # Word generation endpoint
│   ├── words/route.ts      # CRUD for words
│   ├── users/route.ts      # User data endpoint
│   └── auth/[...nextauth]/ # NextAuth handler
├── providers.tsx     # Client-side context providers
└── globals.css       # Global styles
```

## Server vs Client Components

- **Default to Server Components** for all pages and layouts
- Add `"use client"` only when the component needs:
  - React hooks (`useState`, `useEffect`, `useContext`, etc.)
  - Browser APIs (`localStorage`, `window`, etc.)
  - Event handlers (`onClick`, `onChange`, etc.)
  - `next-auth/react` (`useSession`)
  - `next-intl` hooks (`useTranslations`, `useLocale`)

All context providers (`QuizProvider`, `WordsProvider`, etc.) are client components.

## API Route Pattern

Every API route **must** follow this pattern:

```typescript
export async function POST(req: Request) {
  try {
    const { session, ...params } = await req.json();

    // 1. Validate required fields
    if (!session || !requiredField) {
      return NextResponse.json({ error: "..." }, { status: 400 });
    }

    // 2. Connect to database — ALWAYS call this first
    await connectDB();

    // 3. Look up user by session email
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Business logic...

    // 5. Return success
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Critical: `connectDB()` is required

Every API route that touches MongoDB **must** call `await connectDB()` before any Mongoose operation. This function uses a global cache to reuse the connection across requests (see `lib/mongodb/mongodb.ts`).

## Middleware

`src/middleware.ts` handles locale routing via `next-intl/middleware`. It matches all pathnames except `/api`, `/trpc`, `/_next`, `/_vercel`, and files with extensions.

## Auth

- Uses NextAuth with Google provider
- Config in `lib/auth/nextAuthOptions.ts`
- Server-side auth guard: `lib/auth/authGuardSSR.tsx`
- Client-side: `useSession()` from `next-auth/react`
- Session is passed from client to API routes in request body (not cookies/headers)
